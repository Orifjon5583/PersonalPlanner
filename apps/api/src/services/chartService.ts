// import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
// import { ChartConfiguration } from 'chart.js';

// Mock implementation to avoid canvas dependency issues on Windows
export class ChartService {
    static async generateLineChart(label: string, labels: string[], data: number[]) {
        console.warn('Chart generation is disabled due to missing canvas dependency.');
        return Buffer.from(''); // Return empty buffer
    }

    static async generateBarChart(label: string, labels: string[], data: number[], bgColors: string[]) {
        console.warn('Chart generation is disabled due to missing canvas dependency.');
        return Buffer.from(''); // Return empty buffer
    }

    static async generateWeeklyProgressChart(stats: any) {
        // stats: { date: string, count: number }[]
        const labels = stats.map((s: any) => s.date);
        const data = stats.map((s: any) => s.count);
        return this.generateBarChart('Weekly Tasks', labels, data, []);
    }
}
