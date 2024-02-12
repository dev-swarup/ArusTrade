import { Elysia, t } from "elysia";

const app = new Elysia({ serve: { reusePort: true } });

app
    .listen(process.env.PORT || 3000, () => console.log(`⚡️ ArusTrade listening on port ${process.env.PORT || 3000}`));