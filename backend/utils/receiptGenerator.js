const fs = require('fs');
const path = require('path');

/**
 * Generate HTML receipt template
 * @param {Object} receiptData - Receipt data from Receipt model
 * @returns {String} HTML string for receipt
 */
const generateReceiptHTML = (receiptData) => {
  const {
    receiptNumber,
    date,
    customer,
    course,
    company,
    amount,
    taxAmount,
    totalAmount,
    currency
  } = receiptData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount / 100); // Convert paise to rupees
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Receipt - ${receiptNumber}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
                color: #333;
            }
            .receipt-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 1px solid #e1e1e1;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #e74c3c;
                padding-bottom: 20px;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #e74c3c;
                margin-bottom: 5px;
            }
            .company-details {
                font-size: 14px;
                color: #666;
                line-height: 1.4;
            }
            .receipt-title {
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                margin: 30px 0;
                color: #2c3e50;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .receipt-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }
            .receipt-number, .receipt-date {
                font-size: 14px;
                color: #666;
            }
            .receipt-number strong, .receipt-date strong {
                color: #2c3e50;
                font-weight: bold;
            }
            .section {
                margin-bottom: 25px;
            }
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
                border-bottom: 1px solid #ecf0f1;
                padding-bottom: 5px;
            }
            .customer-details, .course-details {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
                border-left: 4px solid #e74c3c;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                align-items: center;
            }
            .detail-label {
                font-weight: 500;
                color: #495057;
                min-width: 120px;
            }
            .detail-value {
                color: #2c3e50;
                font-weight: 600;
                text-align: right;
                flex: 1;
            }
            .course-name {
                font-size: 18px;
                color: #e74c3c;
                font-weight: bold;
            }
            .amount-section {
                border-top: 2px solid #ecf0f1;
                padding-top: 20px;
                margin-top: 20px;
            }
            .amount-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                font-size: 20px;
                font-weight: bold;
                color: #e74c3c;
                border-top: 2px solid #e74c3c;
                padding-top: 10px;
                margin-top: 10px;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ecf0f1;
                color: #666;
                font-size: 12px;
            }
            .thank-you {
                font-size: 18px;
                color: #27ae60;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
            }
            @media print {
                body {
                    background-color: white;
                    padding: 0;
                }
                .receipt-container {
                    box-shadow: none;
                    border: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <div class="company-name">${company.name}</div>
                <div class="company-details">
                    ${company.address}<br>
                    Phone: ${company.phone} | Email: ${company.email}<br>
                    ${company.gstin ? `GSTIN: ${company.gstin}` : ''}
                </div>
            </div>

            <div class="receipt-title">Payment Receipt</div>

            <div class="receipt-info">
                <div class="receipt-number">
                    <strong>Receipt No:</strong> ${receiptNumber}
                </div>
                <div class="receipt-date">
                    <strong>Date:</strong> ${formatDate(date)}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Customer Details</div>
                <div class="customer-details">
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${customer.name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${customer.email}</span>
                    </div>
                    ${customer.phone ? `
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${customer.phone}</span>
                    </div>
                    ` : ''}
                    ${customer.address ? `
                    <div class="detail-row">
                        <span class="detail-label">Address:</span>
                        <span class="detail-value">${customer.address}</span>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="section">
                <div class="section-title">Course Details</div>
                <div class="course-details">
                    <div class="detail-row">
                        <span class="detail-label">Course:</span>
                        <span class="detail-value course-name">${course.name}</span>
                    </div>
                    ${course.description ? `
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${course.description.replace(/<[^>]*>/g, '').substring(0, 100)}...</span>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Course Price:</span>
                        <span class="detail-value">${formatCurrency(course.price * 100)}</span>
                    </div>
                </div>
            </div>

            <div class="amount-section">
                <div class="amount-row">
                    <span>Course Amount:</span>
                    <span>${formatCurrency(amount)}</span>
                </div>
                ${taxAmount > 0 ? `
                <div class="amount-row">
                    <span>Tax Amount:</span>
                    <span>${formatCurrency(taxAmount)}</span>
                </div>
                ` : ''}
                <div class="total-row">
                    <span>Total Amount Paid:</span>
                    <span>${formatCurrency(totalAmount)}</span>
                </div>
            </div>

            <div class="thank-you">
                Thank you for your enrollment!
            </div>

            <div class="footer">
                <p>This is a computer-generated receipt and does not require a signature.</p>
                <p>For any queries, please contact us at ${company.email} or ${company.phone}</p>
                <p>Generated on ${formatDate(new Date())}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate plain text receipt
 * @param {Object} receiptData - Receipt data
 * @returns {String} Plain text receipt
 */
const generateReceiptText = (receiptData) => {
  const {
    receiptNumber,
    date,
    customer,
    course,
    company,
    amount,
    taxAmount,
    totalAmount,
    currency
  } = receiptData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR'
    }).format(amount / 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  return `
═══════════════════════════════���═══════════════════════════
                      PAYMENT RECEIPT
═══════════════════════════════════════════════════════════

${company.name}
${company.address}
Phone: ${company.phone} | Email: ${company.email}
${company.gstin ? `GSTIN: ${company.gstin}` : ''}

---------------------------------------------------------------
Receipt No: ${receiptNumber}
Date: ${formatDate(date)}
---------------------------------------------------------------

CUSTOMER DETAILS:
Name: ${customer.name}
Email: ${customer.email}
${customer.phone ? `Phone: ${customer.phone}` : ''}
${customer.address ? `Address: ${customer.address}` : ''}

---------------------------------------------------------------

COURSE DETAILS:
Course: ${course.name}
${course.description ? `Description: ${course.description.replace(/<[^>]*>/g, '').substring(0, 80)}...` : ''}
Course Price: ${formatCurrency(course.price * 100)}

---------------------------------------------------------------

PAYMENT SUMMARY:
Course Amount: ${formatCurrency(amount)}
${taxAmount > 0 ? `Tax Amount: ${formatCurrency(taxAmount)}` : ''}
---------------------------------------------------------------
TOTAL AMOUNT PAID: ${formatCurrency(totalAmount)}
---------------------------------------------------------------

Thank you for your enrollment!

This is a computer-generated receipt.
For queries, contact: ${company.email} | ${company.phone}

Generated on: ${formatDate(new Date())}
═══════════════════════════════════════════════════════════
  `;
};

/**
 * Save receipt HTML to file
 * @param {String} html - Receipt HTML
 * @param {String} filename - File name
 * @returns {String} File path
 */
const saveReceiptToFile = async (html, filename) => {
  try {
    const receiptsDir = path.join(__dirname, '../uploads/receipts');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filePath = path.join(receiptsDir, filename);
    fs.writeFileSync(filePath, html, 'utf8');
    
    return filePath;
  } catch (error) {
    console.error('Error saving receipt to file:', error);
    throw error;
  }
};

module.exports = {
  generateReceiptHTML,
  generateReceiptText,
  saveReceiptToFile
};
