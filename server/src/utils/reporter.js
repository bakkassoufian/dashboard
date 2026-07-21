import XLSX from 'xlsx';

export const generateExcelReport = (data, title = 'ODC_Report') => {
    // Generate a formatted Excel report from raw data
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données");
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
};

export const aggregateMonthlyKPIs = (beneficiaries) => {
    // Aggregate KPIs per month: total, gender split, age category
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const results = months.map((month, index) => {
        const beneficiariesInMonth = beneficiaries.filter(b => b.sourceMonth === index); // 0-indexed
        return {
           month,
           total: beneficiariesInMonth.length,
           maleCount: beneficiariesInMonth.filter(b => b.gender === 'male').length,
           femaleCount: beneficiariesInMonth.filter(b => b.gender === 'female').length
        }
    });

    return results;
};
