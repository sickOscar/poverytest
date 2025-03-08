import {Context, forAwsEvent, povery, S3Event} from "povery";

function eventHandler(event:S3Event, _context:Context) {
    console.log(`event`, event)
    return {
        "CIAOSSA": "CIAOSSA"
    }
}

exports.handler = povery
    .use(forAwsEvent())
    .load(eventHandler)