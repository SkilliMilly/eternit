Grundregel für shadcn/ui MCP:

Bevor eine eigene Lösung gebaut wird, immer zuerst den shadcn MCP Server abfragen.

Anforderungen:
- Prüfe zuerst, ob shadcn/ui bereits eine passende Komponente, Variante oder empfohlene Pattern-Lösung bietet
- Nutze bestehende shadcn/ui Komponenten und Patterns bevorzugt
- Baue nur dann eine eigene Lösung, wenn shadcn/ui keine passende Option bietet
- Wenn eine eigene Lösung nötig ist, halte sie minimal und kompatibel mit shadcn/ui
- Keine unnötigen Custom-Komponenten bauen
- Keine externen UI Libraries verwenden

Output:
- Kurz sagen, welche shadcn/ui Option geprüft wurde
- Kurz sagen, ob eine native Lösung vorhanden ist
- Danach erst implementieren