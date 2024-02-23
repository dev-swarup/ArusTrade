import { join } from "path";
import { Elysia, t } from "elysia";
import { createRxDatabase } from "rxdb";
import { gc, file, serve, nanoseconds } from "bun";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";

const rxdb = await createRxDatabase({
    name: 'arus.trade',
    storage: getRxStorageMemory()
}), app = new Elysia(), server = serve<{}>({
    reusePort: true, hostname: '0.0.0.0', port: process.env.PORT || 3000, websocket: {
        open: async socket => {

        },

        message: async (socket, message) => {
            try {
                message = typeof message === 'string' ? message : message.toString('utf8');
                if (message && (/^{((&\w+&)|(<\w+>)),(('\w+')|(<\d+>)|(&.*&))+}$/).test(message)) {



                } else
                    socket.send(`{<message>,<3080>`);
            } catch { socket.send(`{<message>,<5181>}`); }
        },

        closeOnBackpressureLimit: true, close: async (socket, code, reason) => {

        }
    },

    fetch: async req => {
        const { pathname, searchParams } = new URL(req.url);

        if (pathname === '/api/connection') {

        } else
            try { return await app.handle(req); } catch {
                if (!pathname.startsWith('/api'))
                    return new Response(file(join(__dirname, 'static', 'error.html')), {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    });
                else
                    return Response.json({ status: true, result: null, error: { code: 'INTERNAL_SERVER_ERROR', message: '' } }, {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
            };
    }
});

console
    .log(`⚡️ ArusTrade listening on port ${server.port} (${`${(nanoseconds() / (100 ** 3)).toFixed()} ms`})`);