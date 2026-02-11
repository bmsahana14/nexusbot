# Embedding NexusBot on Your Website

This guide explains how to embed the NexusBot chat widget on any website.

## Option 1: Script Tag Embed (Recommended)

### Step 1: Build the Widget Bundle

First, we need to create a standalone widget that can be embedded anywhere.

1. **Create a new file** `src/app/widget/page.tsx`:

```tsx
'use client';

import ChatWidget from '@/components/ChatWidget';

export default function WidgetPage() {
  return (
    <div>
      <ChatWidget />
    </div>
  );
}
```

2. **Add to your site** with an iframe:

```html
<!-- Add this to your website's HTML -->
<iframe
  src="https://your-nexusbot-domain.vercel.app/widget"
  style="
    position: fixed;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border: none;
    pointer-events: none;
    z-index: 999999;
  "
  allow="clipboard-write"
></iframe>

<script>
  // Make iframe interactive only for the chat widget area
  const iframe = document.querySelector('iframe');
  iframe.addEventListener('load', function() {
    iframe.contentWindow.postMessage('ready', '*');
  });
</script>
```

## Option 2: NPM Package (Advanced)

For better integration, you can package NexusBot as an NPM module.

### Step 1: Create Package

1. **Create** `package.json` for the widget:

```json
{
  "name": "@yourorg/nexusbot-widget",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}
```

2. **Build and publish**:

```bash
npm run build
npm publish
```

### Step 2: Use in Any React App

```tsx
import { ChatWidget } from '@yourorg/nexusbot-widget';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatWidget apiUrl="https://your-api.vercel.app" />
    </div>
  );
}
```

## Option 3: Direct Integration

For full control, copy the widget component directly into your project.

### Step 1: Copy Files

Copy these files to your project:

1. `src/components/ChatWidget.tsx`
2. `src/app/api/chat/route.ts`
3. `src/lib/rag.ts`
4. `knowledge/` directory

### Step 2: Install Dependencies

```bash
npm install framer-motion langchain @langchain/openai gray-matter marked
```

### Step 3: Import and Use

```tsx
import ChatWidget from '@/components/ChatWidget';

export default function YourPage() {
  return (
    <div>
      {/* Your content */}
      <ChatWidget />
    </div>
  );
}
```

## Configuration Options

### Custom API Endpoint

If you want to use a separate backend:

```tsx
<ChatWidget apiUrl="https://your-custom-api.com/chat" />
```

Update `ChatWidget.tsx`:

```tsx
const response = await fetch(apiUrl || '/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: userMessage.content })
});
```

### Custom Styling

Override the default styles:

```tsx
<ChatWidget
  primaryColor="#your-color"
  position="bottom-left" // or "bottom-right"
  theme="dark" // or "light"
/>
```

### Custom Knowledge Base

Point to a different knowledge base:

```tsx
<ChatWidget knowledgeBaseUrl="https://your-kb.com/api/knowledge" />
```

## Security Considerations

### CORS Configuration

If embedding across domains, configure CORS in `next.config.ts`:

```ts
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },
};
```

### API Key Protection

Never expose your OpenAI API key in client-side code. Always keep it server-side.

### Rate Limiting

Implement rate limiting to prevent abuse:

```ts
// In your API route
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Customization Examples

### Change Colors

```tsx
// In ChatWidget.tsx, update the gradient:
className="bg-gradient-to-br from-green-500 to-blue-600"
```

### Change Position

```tsx
// Change from bottom-right to bottom-left:
className="fixed bottom-6 left-6 z-50"
```

### Change Size

```tsx
// Make the widget larger:
className="w-[500px] h-[700px]"
```

### Add Custom Branding

```tsx
<div className="flex items-center gap-3">
  <img src="/your-logo.png" alt="Logo" className="w-10 h-10" />
  <div>
    <h3 className="font-semibold text-white">Your Bot Name</h3>
    <p className="text-xs text-white/80">Your Tagline</p>
  </div>
</div>
```

## Testing the Embed

1. **Local Testing**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

2. **Production Testing**:
   Deploy to Vercel and test on your target website

3. **Cross-Browser Testing**:
   Test on Chrome, Firefox, Safari, Edge

4. **Mobile Testing**:
   Test on iOS and Android devices

## Troubleshooting

### Widget Not Showing

- Check z-index is high enough
- Verify iframe/component is loaded
- Check console for errors

### API Calls Failing

- Verify CORS is configured
- Check API endpoint is correct
- Ensure API key is set

### Styling Issues

- Check for CSS conflicts
- Verify Tailwind is loaded
- Use iframe for isolation

## Performance Tips

1. **Lazy Load**: Load widget only when needed
2. **Code Splitting**: Use dynamic imports
3. **CDN**: Serve from CDN for faster loading
4. **Caching**: Cache API responses

## Support

For embedding issues:
- Check the documentation
- Review example implementations
- Open an issue on GitHub

---

**Happy Embedding! 🚀**
