import grpc from "k6/net/grpc";
import { sleep } from "k6";

const client = new grpc.Client();
client.load(["pb/hello/"], "hello.proto");

export const options = {
    vus: 5,
    duration: "3s",
};

export default () => {
    client.connect("localhost:9000", {
        plaintext: true,
    });

    const data = { greeting: "Bert" };
    const response = client.invoke("hello.HelloService/SayHello", data);

    console.log(response.message);

    client.close();
    sleep(1);
};
