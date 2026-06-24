declare module '@tanstack/react-start/api' {
  export function createAPIFileRoute(path: string): (options: {
    GET?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
    POST?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
    PUT?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
    PATCH?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
    DELETE?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
    OPTIONS?: (ctx: { request: Request; params: Record<string, string> }) => Response | Promise<Response>;
  }) => any;
}
