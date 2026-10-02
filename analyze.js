export default async function handler(req, res) {
    // Chỉ chấp nhận phương thức POST từ Frontend
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Chỉ chấp nhận phương thức POST' });
    }

    try {
        // Lấy API Key an toàn từ Biến môi trường (Environment Variable) trên Server
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'Chưa cấu hình GEMINI_API_KEY trên Vercel Server!' });
        }

        const { systemInstruction, userPrompt } = req.body;

        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstruction + "\n\n" + userPrompt }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        };

        // Gọi sang Google Gemini API từ phía Backend
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json();
            return res.status(response.status).json({ error: errData.error?.message || "Lỗi khi gọi Google Gemini API." });
        }

        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        
        // Trả kết quả JSON sạch về cho Frontend
        return res.status(200).json(JSON.parse(jsonText));

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ error: error.message || "Lỗi xử lý hệ thống nội bộ." });
    }
}