// Debug version of apiFetch to see what's happening
export async function debugApiFetch(inputPath: string): Promise<void> {
  console.log('=== DEBUG apiFetch ===');
  console.log('Input path:', inputPath);
  
  // Test local API directly
  try {
    const localUrl = `/api${inputPath}`;
    console.log('Trying local URL:', localUrl);
    const localResponse = await fetch(localUrl);
    console.log('Local response status:', localResponse.status);
    console.log('Local response ok:', localResponse.ok);
    const localText = await localResponse.text();
    console.log('Local response (first 200 chars):', localText.substring(0, 200));
    console.log('Is local response JSON?', localText.startsWith('{'));
  } catch (error) {
    console.log('Local API error:', error);
  }
  
  // Test Netlify function path
  try {
    const netlifyUrl = `/.netlify/functions/inventory`;
    console.log('Trying Netlify URL:', netlifyUrl);
    const netlifyResponse = await fetch(netlifyUrl);
    console.log('Netlify response status:', netlifyResponse.status);
    console.log('Netlify response ok:', netlifyResponse.ok);
    const netlifyText = await netlifyResponse.text();
    console.log('Netlify response (first 200 chars):', netlifyText.substring(0, 200));
    console.log('Is Netlify response JSON?', netlifyText.startsWith('{'));
  } catch (error) {
    console.log('Netlify function error:', error);
  }
}
