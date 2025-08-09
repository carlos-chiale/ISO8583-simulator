import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function MessageViewer({
  message,
  response,
  isProcessing = false,
}: {
  message: { formatted: string; wire: string } | null;
  response: { formatted: string; wire: string } | null;
  isProcessing?: boolean;
}) {
  const formatEmvTags = (text: string): string => {
    if (!text) return text;

    const emvTagsMatch = text.match(/Field 055: (.*?)(?:\n|$)/);
    if (!emvTagsMatch || !emvTagsMatch[1]) return text;

    const emvTagsRaw = emvTagsMatch[1];

    if (!emvTagsRaw || emvTagsRaw.trim() === "") return text;

    const formattedTags = emvTagsRaw
      .split(",")
      .map((tag) => {
        const [tagId, value] = tag.split(":");
        if (!tagId || !value) return tag;
        return `    ${tagId}: ${value}`;
      })
      .join("\n");

    return text.replace(
      /Field 055: (.*?)(?:\n|$)/,
      `Field 055 (EMV Tags):\n${formattedTags}\n`
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>ISO 8583 Messages</CardTitle>
        <CardDescription>
          View the raw ISO 8583 message and response
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Request Message</h3>
              {message && <Badge variant="outline">ISO 8583</Badge>}
            </div>

            {message ? (
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="wire">Wire Format</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted">
                  <ScrollArea className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
                      {formatEmvTags(message.formatted)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="wire">
                  <ScrollArea className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm">
                    <div className="break-all">{message.wire}</div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm flex items-center justify-center text-muted-foreground">
                No message generated yet. Submit a transaction to see the ISO
                8583 message.
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Response Message</h3>
              {response && <Badge variant="outline">ISO 8583</Badge>}
            </div>

            {isProcessing ? (
              <div className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Processing transaction...</p>
              </div>
            ) : response ? (
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="wire">Wire Format</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted">
                  <ScrollArea className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm">
                    <pre className="whitespace-pre-wrap">
                      {formatEmvTags(response.formatted)}
                    </pre>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="wire">
                  <ScrollArea className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm">
                    <div className="break-all">{response.wire}</div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-[180px] w-full rounded-md border p-4 bg-muted font-mono text-sm flex items-center justify-center text-muted-foreground">
                No response received yet.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
