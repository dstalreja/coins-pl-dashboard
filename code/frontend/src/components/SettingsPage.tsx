import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import coinsLogo from "figma:asset/51a8b3c7d66d29fa88ccdc6ef32082b1f2273696.png";
import { PageTitle } from "./PageTitle";

export function SettingsPage() {
  return (
    <div className="p-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <img
          src={coinsLogo}
          alt="COINS Logo"
          className="w-16 h-16 rounded-full object-cover"
        />
        <PageTitle title="Settings" />
      </div>

      <div className="max-w-2xl space-y-6">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              COINS Live Trading Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Version 1.0.0
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
