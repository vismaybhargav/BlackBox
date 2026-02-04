import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput } from "@/components/ui/combobox";

export default function LogSearchField() {
    return (
        <Combobox>
          <ComboboxInput placeholder="Search..." className="bg-background"/>
          <ComboboxContent>
            <ComboboxEmpty>
              No results found.
            </ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
    )
}