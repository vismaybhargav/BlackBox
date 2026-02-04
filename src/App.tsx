import { formatFileSize, useCSVReader, usePapaParse } from "react-papaparse";
import { AppSidebar } from "./sidebar/app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";
import { Field, FieldDescription, FieldLabel } from "./components/ui/field";
import { Input } from "./components/ui/input";
import { useState } from "react";

export function App() {
  const { readString } = usePapaParse();
  const [ loadedFile, setLoadingFile ] = useState(false);

  return (
    <SidebarProvider>
      <main className="flex grow">
        <AppSidebar />
        <div>
          <Field>
            <FieldLabel htmlFor="csvInput" >Open CSV File</FieldLabel>
            <Input id="csvInput" type="file" onInput={async (e) => {
                const file = (e.currentTarget).files?.[0];
                if (!file) return;
                const fileContent = await file.text();

                readString(fileContent, {
                  header: true,
                  complete: (results) => {
                    console.log("Parsed Results:", results);
                    setLoadingFile(true);
                  },
                  error: (error) => {
                    console.error("Error parsing CSV:", error);
                  }
                })
            }} />
            <FieldDescription>Select a CSV File</FieldDescription>
          </Field>
        </div>
      </main >
    </SidebarProvider >
  );
}

export default App;
