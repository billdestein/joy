import type { WorkbookType } from '@billdestein/joy-common';
export declare function userDir(slug: string): string;
export declare function workbookDir(slug: string, workbookName: string): string;
export declare function workbookFile(slug: string, workbookName: string): string;
export declare function picFile(slug: string, workbookName: string, filename: string): string;
export declare function readWorkbook(slug: string, workbookName: string): Promise<WorkbookType>;
export declare function writeWorkbook(slug: string, workbookName: string, workbook: WorkbookType): Promise<void>;
export declare function ensureUserDir(slug: string): Promise<void>;
