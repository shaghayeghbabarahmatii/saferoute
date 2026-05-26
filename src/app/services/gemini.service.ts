import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;

  async generateContent(prompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async classifyHazard(category: string, description: string): Promise<string> {
    const prompt = `You are a urban safety assistant. A user submitted a safety report with:
Category: ${category}
Description: ${description}

Provide a brief response with:
1. Hazard Type (more specific than the category)
2. Authority to Notify (Municipality, Traffic Police, Utilities, or Civil Defense)
3. Recommended Action for the user (one sentence)

Keep it concise and practical.`;
    return this.generateContent(prompt);
  }

  async safeRouteAdvisory(destination: string, hazards: string[]): Promise<string> {
    const prompt = `You are a urban safety assistant. A user wants to navigate to: ${destination}
The following hazards were detected along the route:
${hazards.join('\n')}

Provide a brief safety advisory in 2 sentences. Mention if they should take an alternate route.`;
    return this.generateContent(prompt);
  }
}
