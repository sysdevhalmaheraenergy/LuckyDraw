export default function ApiDocsPage() {
  return (
    <>
      <link rel="stylesheet" href="/docs-assets/swagger-ui.css" />
      <div id="swagger-ui" />
      <script src="/docs-assets/swagger-ui-bundle.js" />
      <script src="/docs-assets/swagger-ui-standalone-preset.js" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function () {
              window.ui = SwaggerUIBundle({
                url: "/api/openapi.json",
                dom_id: "#swagger-ui",
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: "StandaloneLayout",
              });
            };
          `,
        }}
      />
    </>
  );
}
