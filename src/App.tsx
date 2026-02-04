import { formatFileSize, useCSVReader, usePapaParse } from "react-papaparse";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import { Field, FieldDescription, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";

export function App() {
  const { readString } = usePapaParse();

  return (
    <SidebarProvider>
      <main className="flex grow">
        <AppSidebar className="bg-gray-200" />
        <div>
          <Field>
            <FieldLabel htmlFor="csvInput" >Picture</FieldLabel>
            <Input id="csvInput" type="file" onInput={async (e) => {
                const file = (e.currentTarget).files?.[0];
                if (!file) return;
                const fileContent = await file.text();

            }} />
            <FieldDescription>Select a CSV File</FieldDescription>
          </Field>
        </div>
      </main >
    </SidebarProvider >
  );
}

export default App;
