
import ReportsDBService from "./reports-db-service.js";

export default class ReportsController {
    static async createReport(req, res) {
        const details = req.body;

        console.log(details)
        const result = await ReportsDBService.insertReport(details);
        if (!result.success) return res.status(500).json({ success: false, error: "Failed to create report" });

        return res.status(200).json({ success: true });
    }
}