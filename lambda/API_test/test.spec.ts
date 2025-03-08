import {APIGatewayEvent, Context, withContext} from 'povery';
import {Controller} from "./index";


describe("A test", () => {

    let controller = new Controller();

    it("should work withContext", withContext(
        {test: 'test'},
        async () => {

            expect(true).toBe(true);
            expect(await controller.getTest({} as APIGatewayEvent, {} as Context)).resolves.toEqual({message: 'Hello worldss'})

        })
    )


})