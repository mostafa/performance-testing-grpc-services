import http from "k6/http";
import { check } from "k6";

export const options = {
    vus: 50,
    duration: "10s",
};

export default function () {
    let res = http.get("http://test.k6.io", {
        tags: {
            my_tag: "I'm a tag",
        },
    });
    check(res, {
        "status was 200": (r) => r.status === 200,
    });
}
