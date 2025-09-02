<?php
header("Content-Type: application/json");

// Yaha apna OpenAI API key lagaye
$apiKey = "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";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $userMessage = $_POST["message"] ?? "";

    $data = [
        "model" => "gpt-4o",  // 
        "messages" => [
            ["role" => "system", "content" => "You are a fitness and health coach expert. Give practical, motivating, and easy-to-follow advice about workouts, diet, lifestyle, and overall health."],
            ["role" => "user", "content" => $userMessage]
        ]
    ];

    $ch = curl_init("https://api.openai.com/v1/chat/completions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Authorization: " . "Bearer $apiKey"
    ]);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);
    curl_close($ch);

    $result = json_decode($response, true);

    echo json_encode([
        "reply" => $result["choices"][0]["message"]["content"] ?? "Error: No response from API"
    ]);
}
