import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";

export default function TopicSearchField(props: { headerFields?: string[] }) {
  return (
    <Combobox>
      <ComboboxInput placeholder="Search..." className="bg-background" />
      <ComboboxContent>
        <ComboboxEmpty>
          No results found.
        </ComboboxEmpty>
        <ComboboxList>
          {props.headerFields?.map((field) => (
            <ComboboxItem key={field} value={field}>{field}</ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
