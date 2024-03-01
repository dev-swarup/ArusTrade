import { join } from "path";
import { Elysia, t } from "elysia";
import { gc, file, serve, nanoseconds } from "bun";

const app = new Elysia(), server = serve<{}>({
    reusePort: true, hostname: '0.0.0.0', port: process.env.PORT || 3000, websocket: {
        open: async socket => {
            socket
                .subscribe('networkTest');
            socket.send(`networkTest:${(new Date()).getTime()}`);
        },

        message: async (socket, message) => {
            try {
                message = typeof message === 'string' ? message : message.toString('utf8');

                const [event, ...data] = message.split(':'); switch (event) {
                    case 'networkTest':
                        const currentTime = (new Date()).getTime();
                        socket.sendText(`networkTest:${Number(data.at(1)) - Number(data.at(0))}:${currentTime - Number(data.at(1))}`); return;
                };
            } catch { };
        },

        closeOnBackpressureLimit: true, idleTimeout: 80, sendPings: false, close: async (socket, code, reason) => {
            socket.unsubscribe('networkTest');
        }
    },

    fetch: async req => {
        const { pathname, searchParams } = new URL(req.url);

        if (pathname === '/api/connection') {
            server.upgrade(req, { data: {} });
        } else if (pathname.startsWith('/static')) {
            try {
                const content = file(join(__dirname, 'contents', 'static', ...pathname.split('/').slice(1)));

                return new Response(await content.text(), {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': content.type
                    }
                });
            } catch {
                return new Response(undefined, {
                    status: 404,
                    statusText: 'NOT_FOUND'
                });
            };
        } else
            try { return await app.handle(req); } catch {
                if (!pathname.startsWith('/api'))
                    return new Response(file(join(__dirname, 'contents', 'error.html')), {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'text/html'
                        }
                    });
                else
                    return Response.json({ status: true, result: null, error: { code: 'INTERNAL_SERVER_ERROR', message: null } }, {
                        status: 200,
                        statusText: 'OK',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
            };
    }
});

app.get('/', async ({ request }) => {
    // Yet to be implemented
});

app.on('error', async ({ code, request }) => {
    if (!(new URL(request.url)).pathname.startsWith('/api'))
        return new Response(file(join(__dirname, 'contents', code === 'NOT_FOUND' ? 'not.html' : 'error.html')), {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'text/html'
            }
        });
    else
        return Response.json({ status: true, result: null, error: { code, message: null } }, {
            status: 200,
            statusText: 'OK',
            headers: {
                'Content-Type': 'application/json'
            }
        });
});

setInterval(async () => server.publish('networkTest', `networkTest:${(new Date()).getTime()}`), 30000);
console
    .log(`⚡️ ArusTrade listening on port ${server.port} (${`${(nanoseconds() / (100 ** 3)).toFixed()} ms`})`);