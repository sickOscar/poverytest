import {acl, api, APIGatewayEvent, Authorizer, Context, controller, povery, PoveryError, pathParam, queryParam, queryParams, body} from "povery";
import {aTest} from "@common/package";
import {ListBucketsCommand, S3Client} from "@aws-sdk/client-s3";
// import {postgresDB} from "@common/db";

// Define some interfaces for validation
interface UserData {
    name: string;
    age: number;
    email: string;
}

interface QueryFilters {
    limit?: number;
    offset?: number;
    sort?: string;
}

// Extend the Context interface for middleware data
interface ExtendedContext extends Context {
    middlewareData?: {
        timestamp: string;
        random: number;
    };
}

@controller
export class Controller {

    @api('GET', '/test')
    @acl(['ADMIN'])
    async getTests() {
        console.log('Test route');
        console.log('ENV', process.env.TEST_ENV_VALUE);
        aTest();

        // const client = new S3Client({region: 'eu-west-1'});
        // const result = await client.send(new ListBucketsCommand({}));
        // console.log('result', result);

        return {
            message: 'Hello worldss'
        }
    }

    /** express-like routes **/
    @api('GET', '/test/:id')
    async getTest(_event:APIGatewayEvent, context:Context) {
        console.log(`context`, context);
        console.log('Route with id', context.requestParams.id);
        console.log('Route with name', context.requestParams.name);

        return {
            message: `Hello world ${context.requestParams.id}`
        }
    }

    @api('GET', '/test/validation/:validated')
    async getTestValidated(
        event:APIGatewayEvent, 
        context:Context,
        @pathParam({name: 'validated'}) validated: string
    ) {
        console.log('Route with validated', validated);
        return {
            message: `Hello world ${validated}`
        }
    }

    /** example of async execution **/
    @api('POST', '/test')
    async insertTest(event:APIGatewayEvent, _context:Context):Promise<{exit: string, body: any}> {
        const result = {exit: 'ok', body: JSON.parse(event.body)}
        return new Promise(resolve => {
            setTimeout(() => {resolve(result)}, 700)
        });
    }

    // generic 500 internal server error
    @api('GET', '/error')
    async errorTest(_event:APIGatewayEvent, _context:Context) {
        throw new Error('Oh no :(')
    }

    // status code error
    @api('PUT', '/error')
    async customErrorTest(_event:APIGatewayEvent, _context:Context) {
        throw new PoveryError(`You can't :(`, 403)
    }

    // 403 route
    @api('POST', '/error')
    async aclErrorTest(_event:APIGatewayEvent, _context:Context) {
        console.log('This should not be logged...')
    }

    rpcMethod(payload:any, _context:Context):{result: string} {
        console.log('RPC method called with payload', payload);
        return {result: 'ok'}
    }

    // NEW TEST ROUTES

    // Test for query parameters
    @api('GET', '/test-query')
    async testQueryParams(
        _event: APIGatewayEvent,
        _context: Context,
        @queryParam({name: 'name'}) name: string,
        @queryParam({name: 'age', transform: (val) => parseInt(val, 10)}) age: number
    ) {
        return {
            message: `Hello ${name}, you are ${age} years old`,
            params: { name, age }
        };
    }

    // Test for all query parameters
    @api('GET', '/test-all-query')
    async testAllQueryParams(
        _event: APIGatewayEvent,
        _context: Context,
        @queryParams() params: QueryFilters
    ) {
        return {
            message: 'Query parameters received',
            params
        };
    }

    // Test for body validation
    @api('POST', '/test-body')
    async testBodyValidation(
        _event: APIGatewayEvent,
        _context: Context,
        @body({
            validate: true,
            transform: (body) => {
                // Custom validation
                if (!body.name || typeof body.name !== 'string') {
                    throw new PoveryError('Name is required and must be a string', 400);
                }
                if (!body.age || typeof body.age !== 'number') {
                    throw new PoveryError('Age is required and must be a number', 400);
                }
                if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
                    throw new PoveryError('Valid email is required', 400);
                }
                return body;
            }
        }) userData: UserData
    ) {
        return {
            message: `User ${userData.name} created`,
            user: userData
        };
    }

    // Test for middleware context
    @api('GET', '/test-middleware')
    async testMiddleware(_event: APIGatewayEvent, context: ExtendedContext) {
        return {
            message: 'Middleware test',
            middlewareData: context.middlewareData || 'No middleware data found'
        };
    }

    // Test for different HTTP methods
    @api('PUT', '/test-methods')
    async testPut(_event: APIGatewayEvent, _context: Context) {
        return {
            method: 'PUT',
            message: 'PUT method handled'
        };
    }

    @api('DELETE', '/test-methods/:id')
    async testDelete(
        _event: APIGatewayEvent, 
        _context: Context,
        @pathParam({name: 'id'}) id: string
    ) {
        return {
            method: 'DELETE',
            message: `Resource ${id} deleted`
        };
    }

    @api('PATCH', '/test-methods/:id')
    async testPatch(
        _event: APIGatewayEvent, 
        _context: Context,
        @pathParam({name: 'id'}) id: string,
        @body() patchData: any
    ) {
        return {
            method: 'PATCH',
            message: `Resource ${id} patched`,
            patchData
        };
    }

    // Test for nested routes
    @api('GET', '/nested/routes/test')
    async testNestedRoutes(_event: APIGatewayEvent, _context: Context) {
        return {
            message: 'Nested route works'
        };
    }

    // Test for error handling with specific status codes
    @api('GET', '/test-errors/:code')
    async testErrorCodes(
        _event: APIGatewayEvent,
        _context: Context,
        @pathParam({
            name: 'code',
            transform: (val) => parseInt(val, 10)
        }) code: number
    ) {
        if (code >= 400 && code < 600) {
            throw new PoveryError(`Error with code ${code}`, code);
        }
        
        return {
            message: `No error, code ${code} is not an error code`
        };
    }
}

// Custom middleware for testing
const testMiddleware = {
    setup: (context: ExtendedContext) => {
        console.log('Test middleware setup');
        context.middlewareData = {
            timestamp: new Date().toISOString(),
            random: Math.random()
        };
    },
    teardown: () => {
        console.log('Test middleware teardown');
    }
};

exports.handler = povery
    // .use(Authorizer(Controller,  {
    //     roleClaim: 'custom:role',   
    // }))
    // .use(postgresDB)
    .use(() => {console.log('Middleware 1');})
    .use({
        setup: () => console.log('middleware 2 setup'),
        teardown: () => console.log('middleware 2 teardown'),
    })
    .use(testMiddleware)
    .load(Controller);
