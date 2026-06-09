import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  private cleanResponse(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .trim();
  }

  private async fetchWithRetry(url: string, body: any, retries = 2): Promise<any> {
    for (let i = 0; i < retries; i++) {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.status === 429) {
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        throw new Error('rate_limit');
      }
      return data;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const url = this.endpoint + '?key=' + environment.geminiApiKey;
    const body = { contents: [{ parts: [{ text: prompt }] }] };
    const data = await this.fetchWithRetry(url, body);
    return this.cleanResponse(data.candidates[0].content.parts[0].text);
  }

  async analyzeImage(prompt: string, image: string, type: string): Promise<string> {
    const url = this.endpoint + '?key=' + environment.geminiApiKey;
    const body = {
      contents: [{
        parts: [
          { inlineData: { data: image, mimeType: type } },
          { text: prompt }
        ]
      }]
    };
    const data = await this.fetchWithRetry(url, body);
    if (data.error) throw new Error(data.error.message);
    return this.cleanResponse(data.candidates[0].content.parts[0].text);
  }

  async classifyHazard(category: string, description: string): Promise<string> {
    try {
      const prompt = `You are an urban safety assistant. A user submitted a safety report:
Category: ${category}
Description: ${description}

Respond in exactly this format (no markdown, no asterisks):
Hazard Type: [specific type]
Authority to Notify: [Municipality / Traffic Police / Utilities / Civil Defense]
Recommended Action: [one sentence advice for the user]`;
      return await this.generateContent(prompt);
    } catch {
      return `Hazard Type: ${category}\nAuthority to Notify: Municipality\nRecommended Action: Avoid the area and report to local authorities immediately.`;
    }
  }

  async analyzeHazardPhoto(imageBase64: string, imageType: string): Promise<string> {
    try {
      const prompt = `You are an urban safety assistant. Analyze this photo of a potential safety hazard.
Describe what you see in 1-2 sentences. Focus on the safety issue visible in the image.
Be concise and specific. No markdown, no asterisks, plain text only.`;
      return await this.analyzeImage(prompt, imageBase64, imageType);
    } catch {
      return 'A potential safety hazard is visible in this image. The area should be inspected and reported to the relevant authorities.';
    }
  }

  async safeRouteAdvisory(destination: string, hazards: string[]): Promise<string> {
    try {
      const prompt = `You are an urban safety assistant. A user wants to navigate to: ${destination}
Hazards detected along the route:
${hazards.join('\n')}

Provide a 2-sentence safety advisory. No markdown, no asterisks, plain text only.`;
      return await this.generateContent(prompt);
    } catch {
      return 'Hazards have been detected along your route. Exercise caution and consider an alternative path where possible.';
    }
  }
}