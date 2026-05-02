export const exportUtils = {
  // Funksioni që merr çfarëdolloj liste dhe e shkarkon si skedar CSV
  downloadCSV: (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      console.warn('Nuk ka të dhëna për të eksportuar.');
      return;
    }

    // 1. Merr titujt e kolonave nga objekti i parë
    const headers = Object.keys(data[0]).join(',');

    // 2. Kthe çdo rresht në vlera të ndara me presje
    const rows = data.map(row => 
      Object.values(row)
        .map(value => `"${value}"`) 
        .join(',')
    ).join('\n');

    // 3. Bashkoji dhe krijo skedarin
    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 4. Simulo klikimin për shkarkim
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};