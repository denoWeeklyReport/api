export interface ReportSchema {
    _id: { $oid: string };
    username: string;
    year: number;
    week: number;
    text: string;
}