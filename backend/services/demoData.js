const { faker } = require('@faker-js/faker');

const NUM_CUSTOMERS = 10000;
const NUM_INVOICES_PER_CUSTOMER = 30; // Total 300,000 invoices
const NUM_USAGELOGS_PER_CUSTOMER = 9; // Total 90,000 usage logs
const NUM_PAYMENTS_PER_INVOICE = 1; // For simplicity, one payment attempt per invoice

// Static plans for consistent referencing
const generatePlans = () => [
    { id: 1, name: 'Basic', price: 10, call_minutes: 100, sms_count: 50, data_usage: 1024, callRate: 0.1, dataRate: 0.5, smsRate: 0.05, status: 'active', features: {} },
    { id: 2, name: 'Premium', price: 20, call_minutes: 200, sms_count: 100, data_usage: 2048, callRate: 0.05, dataRate: 0.3, smsRate: 0.02, status: 'active', features: {} },
    { id: 3, name: 'Pro', price: 50, call_minutes: 500, sms_count: 200, data_usage: 5120, callRate: 0.03, dataRate: 0.1, smsRate: 0.01, status: 'active', features: {} },
];

const generateCustomer = (planIds, customerId) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
        id: customerId, // Assigning manual ID for consistency
        name: `${firstName} ${lastName}`,
        phone_number: faker.phone.number('###########'), // 11 digits
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        address: faker.location.streetAddress(false),
        planId: planIds[customerId % planIds.length],
        status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    };
};

const generateBill = (customerId, planId, billId) => {
    return {
        id: billId,
        customerId: customerId,
        planId: planId,
        amount: parseFloat(faker.finance.amount({ min: 5, max: 100, dec: 2 })),
        date: faker.date.recent(),
    };
};

const generateInvoice = (customerId, billId, invoiceId) => {
    const issueDate = faker.date.past({ years: 1 });
    const dueDate = faker.date.future({ years: 1, refDate: issueDate });
    return {
        id: invoiceId,
        customerId: customerId,
        billId: billId,
        invoiceNumber: faker.string.alphanumeric(10).toUpperCase(),
        issueDate: issueDate,
        dueDate: dueDate,
        amountDue: parseFloat(faker.finance.amount({ min: 10, max: 200, dec: 2 })),
        pdfPath: null,
        status: faker.helpers.arrayElement(['pending', 'paid', 'overdue', 'cancelled']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    };
};

const generatePayment = (customerId, billId, invoiceId, paymentId, amount) => {
    return {
        id: paymentId,
        amount: amount || parseFloat(faker.finance.amount({ min: 5, max: 200, dec: 2 })),
        payment_date: faker.date.recent(),
        payment_method: faker.helpers.arrayElement(['credit_card', 'paypal', 'mpesa', 'bank_transfer']),
        receipt_number: faker.string.alphanumeric(12).toUpperCase(),
        status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
        customerId: customerId,
        billId: billId,
        invoiceId: invoiceId, // Assuming invoiceId is part of Payment schema
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    };
};

const generateUsageLog = (customerId, planId, usageLogId) => {
    const usageType = faker.helpers.arrayElement(['call', 'sms', 'data']);
    let duration;
    if (usageType === 'call') {
        duration = faker.number.int({ min: 1, max: 300 }); // minutes
    } else if (usageType === 'sms') {
        duration = faker.number.int({ min: 1, max: 100 }); // count
    } else { // data
        duration = faker.number.int({ min: 10, max: 5000 }); // MB
    }
    return {
        id: usageLogId,
        customerId: customerId,
        planId: planId,
        usageType: usageType,
        duration: duration,
        timestamp: faker.date.recent(),
    };
};

const generateReport = (customerId, reportId) => {
    return {
        id: reportId,
        customerId: customerId,
        reportType: faker.helpers.arrayElement(['Monthly Revenue', 'Customer Usage', 'Service Performance']),
        data: {
            totalRevenue: parseFloat(faker.finance.amount({ min: 100, max: 10000, dec: 2 })),
            totalDataUsage: faker.number.int({ min: 1000, max: 100000 }),
            totalCallDuration: faker.number.int({ min: 500, max: 5000 }),
        },
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    };
};

const generateDemoData = () => {
    const plans = generatePlans();
    const planIds = plans.map(p => p.id);

    const customers = [];
    const bills = [];
    const invoices = [];
    const payments = [];
    const usageLogs = [];
    const reports = [];

    let customerIdCounter = 1;
    let billIdCounter = 1;
    let invoiceIdCounter = 1;
    let paymentIdCounter = 1;
    let usageLogIdCounter = 1;
    let reportIdCounter = 1;

    console.log(`Generating ${NUM_CUSTOMERS} customers...`);
    for (let i = 0; i < NUM_CUSTOMERS; i++) {
        const customer = generateCustomer(planIds, customerIdCounter++);
        customers.push(customer);

        // Generate bills for each customer (small number for realism, not 400k)
        const numBills = faker.number.int({ min: 1, max: 5 });
        for (let j = 0; j < numBills; j++) {
            const bill = generateBill(customer.id, customer.planId, billIdCounter++);
            bills.push(bill);
        }

        console.log(`Generating ${NUM_INVOICES_PER_CUSTOMER} invoices for customer ${customer.id}...`);
        for (let j = 0; j < NUM_INVOICES_PER_CUSTOMER; j++) {
            const customerBills = bills.filter(b => b.customerId === customer.id);
            if (customerBills.length > 0) {
                const billForInvoice = faker.helpers.arrayElement(customerBills);
                const invoice = generateInvoice(customer.id, billForInvoice.id, invoiceIdCounter++);
                invoices.push(invoice);

                // Generate payments for invoices
                if (invoice.status === 'paid' || faker.helpers.arrayElement([true, false])) { // Some pending/failed payments
                    const payment = generatePayment(customer.id, invoice.billId, invoice.id, paymentIdCounter++, invoice.amountDue);
                    payments.push(payment);
                }
            }
        }

        console.log(`Generating ${NUM_USAGELOGS_PER_CUSTOMER} usage logs for customer ${customer.id}...`);
        for (let j = 0; j < NUM_USAGELOGS_PER_CUSTOMER; j++) {
            const usageLog = generateUsageLog(customer.id, customer.planId, usageLogIdCounter++);
            usageLogs.push(usageLog);
        }

        // Generate a few reports for a subset of customers
        if (faker.datatype.boolean({ probability: 0.1 })) { // 10% of customers get a report
            const report = generateReport(customer.id, reportIdCounter++);
            reports.push(report);
        }
    }

    console.log('Finished generating demo data.');

    return {
        plans,
        customers,
        bills,
        invoices,
        payments,
        usageLogs,
        reports,
    };
};

module.exports = generateDemoData;
