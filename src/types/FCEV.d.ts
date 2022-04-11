interface FCEVReceiptInterface {
    total: number;
    priority: number;
    general: number;
}
interface FCEVInterface {
    province: string;
    city: string;
    category: string;
    announcements: FCEVReceiptInterface;
    applicants: FCEVReceiptInterface;
    shipments: FCEVReceiptInterface;
    remaining: FCEVReceiptInterface;
    note?: string;
}

export {
    FCEVInterface,
    FCEVReceiptInterface
}