import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables for this service to access GEMINI_API_KEY directly

@Injectable()
export class DocumentExtractionService {
  private readonly geminiModel: GenerativeModel;

  constructor() {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      // In NestJS, it's better to throw an error during module initialization
      // or at the constructor level if a critical dependency is missing.
      // This will prevent the application from starting if the key isn't set.
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured in environment variables.',
      );
    }
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); // Or 'gemini-1.5-pro'
  }

  /**
   * Extracts specified information from an identity document using the Gemini API.
   * @param {Buffer} fileBuffer - The buffer of the document file (image or PDF).
   * @param {string} mimeType - The MIME type of the document file (e.g., 'image/jpeg', 'application/pdf').
   * @returns {Promise<any>} A promise that resolves with the extracted data as a JSON object.
   * @throws {InternalServerErrorException} If Gemini API call fails or JSON parsing fails.
   */
  async extractDataFromDocument(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{
    id_type: string | null;
    id_number: string | null;
    date_of_birth: string | null;
    person_name: string | null;
    address: string | null;
    document_country: string | null;
    issued_date: string | null;
    expiry_date: string | null;
  }> {
    if (!fileBuffer || !mimeType) {
      throw new BadRequestException('File buffer and MIME type are required.');
    }

    const imagePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const prompt = `
    Extract the following information from this identity document (which can be an ID card, passport, or driving license) and return it as a JSON object.
    Ensure the output strictly follows the JSON format provided below.
    If a specific field is not found in the document or is not applicable, its value should be 'null'.
    The 'document_country' should be an ISO2 country code (e.g., 'US', 'GB', 'DE', 'PK').

    JSON Output Format Example:
    {
      "id_type": "string ('NATIONAL_IDENTITY_CARD', 'PASSPORT', 'Driving_License', 'RESIDENCE_PERMIT')",
      "id_number": "string",
      "date_of_birth": "YYYY-MM-DD or null",
      "person_name": "string (Full Name)",
      "address": "string or null",
      "document_country": "ISO2 code (e.g., 'US', 'GB', 'DE', 'PK') or null",
      "issued_date": "YYYY-MM-DD or null",
      "expiry_date": "YYYY-MM-DD or null"
    }

    Document content to analyze:
    `;

    try {
      const result = await this.geminiModel.generateContent([prompt, imagePart]);

      const responseText = result.response.text();

      let extractedData;
      try {
        // Gemini might wrap JSON in markdown, so try to extract it
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          extractedData = JSON.parse(jsonMatch[1]);
        } else {
          // If not markdown-wrapped, try direct parsing
          extractedData = JSON.parse(responseText);
        }
      } catch (jsonParseError) {
        console.error('Failed to parse Gemini response as JSON:', responseText, jsonParseError);
        throw new InternalServerErrorException(
          'Document extraction service returned unparseable data from Gemini.',
        );
      }

      return extractedData;
    } catch (error) {
      console.error('Error during Gemini API call:', error);
      // Re-throw NestJS specific exceptions for better error handling in controllers
      if (error instanceof BadRequestException) {
        throw error; // Re-throw if it's already a controlled bad request
      } else if (error.response && error.response.status) {
        throw new InternalServerErrorException(
          `Gemini API error (Status: ${error.response.status}): ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        `An unexpected error occurred during document extraction: ${error.message}`,
      );
    }
  }
}
