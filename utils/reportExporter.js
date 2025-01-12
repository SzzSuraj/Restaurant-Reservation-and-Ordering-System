const PDFDocument = require('pdfkit');
const { stringify } = require('csv-stringify/sync');

// Generate PDF
const generatePDF = async (data) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {});

    doc.text('Daily Reports', { align: 'center', underline: true });
    doc.moveDown();

    data.forEach(item => {
        doc.text(`Date: ${item.date}`);
        doc.text(`Total Orders: ${item.totalOrders}`);
        doc.text(`Total Reservations: ${item.totalReservations}`);
        doc.text(`Revenue: $${item.revenue.toFixed(2)}`);
        doc.moveDown();
    });

    doc.end();
    return Buffer.concat(buffers);
};

// Generate CSV
const generateCSV = (data) => {
    return stringify(data, { header: true });
};

module.exports = { generatePDF, generateCSV };
