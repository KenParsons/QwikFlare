import { RequestHandler } from "~/qwik-city/runtime/src"

export const onGet:RequestHandler<`hi ${number}`, { sampleObject: { 
    testNumber: number,
    testString: string
} } > = (requestEvent) => {
    const additionalNumber = 1021814;
    const sum = requestEvent.inputs.sampleObject.testNumber + additionalNumber;
    return "hi " + sum
}