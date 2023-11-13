import type { RequestDTO, ResponseDTO } from './types';

const sendString = async (endpoint: string, data: string): Promise<ResponseDTO> => {
    const response = await fetch(`${process.env.API_URL}/api/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ data: data } as RequestDTO),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const result = await response.json() as ResponseDTO;

    return result;
};

export const getSortedCode = async (codeString: string): Promise<ResponseDTO> => {
    return await sendString('code', codeString);
};
