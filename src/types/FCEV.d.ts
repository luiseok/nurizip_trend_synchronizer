interface FCEVReceipt {
    total: number;
    priority: number;
    general: number;
}
interface FCEVSubsidyStatus {
    province: string;
    city: string;
    category: string;
    announcement: FCEVReceipt;
    applicant: FCEVReceipt;
    shipment: FCEVReceipt;
    remaining: FCEVReceipt;
    details?: string;
    hash?: string;
    amount: number
}
interface FCEVSubsidy {
    province: string,
    city: string,
    category: string,
    amount: number
}

export {
    FCEVSubsidyStatus,
    FCEVReceipt,
    FCEVSubsidy
}