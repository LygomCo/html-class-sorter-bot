export interface PullFile {
    filename: string;
    content: string;
};

export interface ResponseDTO {
    data: any;
    isSuccess: boolean;
    message: string;
};

export interface RequestDTO {
    data: string;
};
