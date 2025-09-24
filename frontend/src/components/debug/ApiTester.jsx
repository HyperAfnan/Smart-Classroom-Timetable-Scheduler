import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { testPayload } from "@/config/testPayload.js";

export const ApiTester = () => {
  const [url, setUrl] = useState("http://localhost:8000/generate-timetable");
  const [payload, setPayload] = useState(JSON.stringify(testPayload, null, 2));

  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setError("");
    setResponse("");
    setStatus(null);

    try {
      const parsedPayload = JSON.parse(payload);
      console.log("Sending request to:", url);
      console.log("With payload:", parsedPayload);

      // Make sure the payload is properly formatted as JSON
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      setStatus(resp.status);

      const data = await resp.text();
      try {
        // Try to parse as JSON for pretty display
        const jsonData = JSON.parse(data);
        setResponse(JSON.stringify(jsonData, null, 2));
      } catch (e) {
        // If not JSON, display as text
        setResponse(data);
      }

      if (!resp.ok) {
        setError(`Request failed with status: ${resp.status}`);
      }
    } catch (err) {
      console.error("API test error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset to working example payload
  const resetToExample = () => {
    setPayload(JSON.stringify(testPayload, null, 2));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          API Tester
          {status && (
            <Badge
              className={
                status >= 200 && status < 300 ? "bg-green-500" : "bg-red-500"
              }
            >
              {status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">API URL</label>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:8000/generate-timetable"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Request Payload (JSON)
          </label>
          <Textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTest} disabled={loading} className="flex-1">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing API...
              </>
            ) : (
              <>
                {status && status >= 200 && status < 300 ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : null}
                Send Request
              </>
            )}
          </Button>

          <Button variant="outline" onClick={resetToExample} disabled={loading}>
            Reset to Example
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {response && (
          <div>
            <label className="block text-sm font-medium mb-1">Response</label>
            <div className="bg-slate-100 p-3 rounded-md">
              <pre className="text-xs overflow-auto whitespace-pre-wrap">
                {response}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTester;
