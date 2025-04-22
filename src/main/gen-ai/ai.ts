export interface AI {
    getResponse(prompt: string): Promise<string>;
    getImgResponse(prompt: string, imgPath: string): Promise<string>;
}