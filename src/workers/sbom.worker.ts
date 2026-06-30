import { parseSBOM } from '../parsers';

self.onmessage = (e: MessageEvent) => {
  const { content, fileName } = e.data;
  try {
    const result = parseSBOM(content, fileName);
    self.postMessage({ type: 'success', data: result });
  } catch (error: any) {
    self.postMessage({
      type: 'error',
      message: error.message,
      line: error.line,
      field: error.field
    });
  }
};
