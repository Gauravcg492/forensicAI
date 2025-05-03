/**
 * Interface for AI Models
 */
export interface AI {
    /**
     * Generates a text response based on the provided prompt
     * @param prompt - The input text prompt for the AI model
     * @returns AI-generated response as a string
     * @throws Error if the AI service fails to generate a response
     */
    getResponse(prompt: string): Promise<string>;

    /**
     * Analyzes an image with the given prompt and generates a text response
     * @param prompt - The text prompt describing what to analyze in the image
     * @param imgPath - File system path to the image to be analyzed
     * @returns AI-generated analysis as a string
     * @throws Error if the image cannot be processed or the AI service fails
     */
    getImgResponse(prompt: string, imgPath: string): Promise<string>;
}