import { formatFileSize, useCSVReader } from "react-papaparse";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import "./index.css";

export function App() {
  const { CSVReader } = useCSVReader();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <CSVReader
          onUploadAccepted={(results: any) => {
            console.log(results)
          }}
        >
          {({
            getRootProps,
            acceptedFile,
            ProgressBar,
            getRemoveFileProps,
            Remove
          }: any) => (
            <>
              <div
                {...getRootProps()}
              >
                {acceptedFile ? (
                  <div>
                    <div>
                      <span>
                        {formatFileSize(acceptedFile.size)}
                      </span>
                      <span>{acceptedFile.name}</span>
                    </div>
                  </div>
                ) : (
                  "Drop CSV here or click upload"
                )}
              </div>
            </>
          )}
        </CSVReader>
      </main>
    </SidebarProvider>
  );
}

export default App;
