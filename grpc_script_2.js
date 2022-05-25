import grpc from "k6/net/grpc";
import { Rate } from "k6/metrics";
import { check, group, sleep } from "k6";

const client = new grpc.Client();
// client.load(["pb/hello/"], "hello.proto");

export const options = {
    // discardResponseBodies: true,
    vus: 5000,  // Use too many VUs to fail the test by thresholds
    duration: "10s",
    thresholds: {
        grpc_req_duration: [
            {
                threshold: "p(95)<=10",  // Set to a very low value to test thresholds
                abortOnFail: true,
                delayAbortEval: "1s",
            },
            {
                threshold: "p(99.999)<=500",
            },
        ],
    },
};

// Create a rate for the number of requests
const grpc_reqs = new Rate("grpc_reqs");

export default () => {
    // Connect to the server
    client.connect("localhost:9000", {
        plaintext: true,
        reflect: true,
    });

    group("Say hello to Bert", function () {
        const data = { greeting: "Bert" };

        for (let i = 0; i < 100; i++) {
            // Invoke the SayHello RPC (unary)
            const response = client.invoke("hello.HelloService/SayHello", data);

            // Add one to the counter for each request
            grpc_reqs.add(response.status === grpc.StatusOK);

            // Check that the response status is OK
            check(response, {
                "status is OK": (r) => r && r.status === grpc.StatusOK,
            });

            // Check that the response message is correct
            check(response.message, {
                "greeting is Bert": (r) => r && r.reply === "hello Bert",
            });

            // Sleep per request
            // sleep(1);
        }

        // Sleep per group
        // sleep(1);
    });

    // Close the client connection
    client.close();

    // Sleep per iteration
    // sleep(1);
};
