interface EVInterface {
    province: string;
    city: string;
    category: string;
    announcements: EVReceiptInterface;
    applicants: EVReceiptInterface;
    shipments: EVReceiptInterface;
    remaining: EVReceiptInterface;
}

interface EVReceiptInterface {
    total: number;
    priority: number;
    general: number;
}

export {
    FCEV,
    EVReceiptInterface
}