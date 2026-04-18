import "@testing-library/jest-dom/vitest";
import { server } from "./server";

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 20;

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
