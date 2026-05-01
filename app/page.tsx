"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "recharts"
import {
  type Column,
  type ColumnDef,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  AlertCircle,
  ArrowDown,
  BarChart3,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Check,
  ChevronsUpDown,
  ClipboardList,
  Database,
  FilePlus,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Mitarbeiter = {
  id: string
  vorname: string
  nachname: string
  personalNr: string | null
  position: string
  createdAt: string | null
  updatedAt: string | null
}

const positionLabels: Record<string, string> = {
  teamleiter: "Teamleiter",
  "stv-teamleiter": "Stv. Teamleiter",
  anlagebediener: "Anlagebediener",
}

function getSortIcon<T>(column: Column<T>) {
  const sorted = column.getIsSorted()
  if (sorted === "asc") return <ArrowUp />
  if (sorted === "desc") return <ArrowDown />
  return <ArrowUpDown className="text-muted-foreground" />
}

function cycleSort<T>(column: Column<T>) {
  const current = column.getIsSorted()
  if (current === "asc") {
    column.toggleSorting(true)
  } else if (current === "desc") {
    column.clearSorting()
  } else {
    column.toggleSorting(false)
  }
}

async function fetchMitarbeiter(): Promise<Mitarbeiter[]> {
  const res = await fetch("/api/mitarbeiter")
  if (!res.ok) throw new Error("Failed to fetch employees")
  return res.json()
}

async function createMitarbeiter(data: Omit<Mitarbeiter, "createdAt" | "updatedAt">) {
  const res = await fetch("/api/mitarbeiter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create employee")
}

async function updateMitarbeiter(id: string, data: Partial<Mitarbeiter>) {
  const res = await fetch(`/api/mitarbeiter/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update employee")
}

async function deleteMitarbeiter(id: string) {
  const res = await fetch(`/api/mitarbeiter/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete employee")
}

async function bulkMitarbeiterAction(body: { ids: string[]; action: string; position?: string }) {
  const res = await fetch("/api/mitarbeiter/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to perform bulk action")
}

const UNASSIGNED_VALUE = "__unassigned__"

type ApiAbteilung = {
  id: string
  name: string
  createdAt: string | null
  updatedAt: string | null
}

type ApiFehlercode = {
  id: string
  code: string | null
  beschreibung: string
  departmentId: string | null
  createdAt: string | null
  updatedAt: string | null
}

async function fetchAbteilungen(): Promise<ApiAbteilung[]> {
  const res = await fetch("/api/abteilungen")
  if (!res.ok) throw new Error("Failed to fetch departments")
  return res.json()
}

async function createAbteilung(data: { id: string; name: string }) {
  const res = await fetch("/api/abteilungen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create department")
}

async function updateAbteilung(id: string, data: { name: string }) {
  const res = await fetch(`/api/abteilungen/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update department")
}

async function deleteAbteilungApi(id: string) {
  const res = await fetch(`/api/abteilungen/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete department")
}

async function fetchFehlercodes(): Promise<ApiFehlercode[]> {
  const res = await fetch("/api/fehlercodes")
  if (!res.ok) throw new Error("Failed to fetch error codes")
  return res.json()
}

async function createFehlercode(data: Omit<ApiFehlercode, "createdAt" | "updatedAt">) {
  const res = await fetch("/api/fehlercodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create error code")
}

async function updateFehlercode(id: string, data: Partial<ApiFehlercode>) {
  const res = await fetch(`/api/fehlercodes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update error code")
}

async function deleteFehlercodeApi(id: string) {
  const res = await fetch(`/api/fehlercodes/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete error code")
}

async function bulkDeleteFehlercodes(ids: string[]) {
  const res = await fetch("/api/fehlercodes/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action: "delete" }),
  })
  if (!res.ok) throw new Error("Failed to delete error codes")
}

async function bulkAssignFehlercodes(ids: string[], departmentId: string | null) {
  const res = await fetch("/api/fehlercodes/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids, action: "assignDepartment", departmentId }),
  })
  if (!res.ok) throw new Error("Failed to assign department")
}

function MitarbeiterPage() {
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [bulkApplyOpen, setBulkApplyOpen] = React.useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  const [vorname, setVorname] = React.useState("")
  const [nachname, setNachname] = React.useState("")
  const [personalNr, setPersonalNr] = React.useState("")
  const [position, setPosition] = React.useState("")

  const [errors, setErrors] = React.useState<{
    vorname?: string
    nachname?: string
  }>({})

  const [mitarbeiter, setMitarbeiter] = React.useState<Mitarbeiter[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [bulkPosition, setBulkPosition] = React.useState("")

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const selectedCount = Object.keys(rowSelection).length

  React.useEffect(() => {
    loadMitarbeiter()
  }, [])

  async function loadMitarbeiter() {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchMitarbeiter()
      setMitarbeiter(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnDef<Mitarbeiter>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="rounded-none"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="rounded-none"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Zeile auswählen"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "vorname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cycleSort(column)}
            className="-ml-2"
          >
            Vorname
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "nachname",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cycleSort(column)}
            className="-ml-2"
          >
            Nachname
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "personalNr",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cycleSort(column)}
            className="-ml-2"
          >
            Personal-Nr
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "position",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cycleSort(column)}
            className="-ml-2"
          >
            Position
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => positionLabels[row.original.position] || row.original.position,
      },
      {
        id: "actions",
        header: "Aktionen",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => openEditDialog(row.original)}
            >
              <Pencil />
              <span className="sr-only">Bearbeiten</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 />
              <span className="sr-only">Löschen</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const filteredData = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return mitarbeiter
    return mitarbeiter.filter(
      (m) =>
        m.vorname.toLowerCase().includes(query) ||
        m.nachname.toLowerCase().includes(query) ||
        (m.personalNr?.toLowerCase().includes(query) ?? false)
    )
  }, [mitarbeiter, searchQuery])

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })

  function openCreateDialog() {
    resetForm()
    setEditingId(null)
    setDialogOpen(true)
  }

  function openEditDialog(mitarbeiter: Mitarbeiter) {
    setVorname(mitarbeiter.vorname)
    setNachname(mitarbeiter.nachname)
    setPersonalNr(mitarbeiter.personalNr || "")
    setPosition(mitarbeiter.position)
    setErrors({})
    setEditingId(mitarbeiter.id)
    setDialogOpen(true)
  }

  function handleDelete(id: string) {
    setDeleteId(id)
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      await deleteMitarbeiter(deleteId)
      await loadMitarbeiter()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setDeleteId(null)
    }
  }

  function handleBulkApply() {
    if (!bulkPosition) return
    setBulkApplyOpen(true)
  }

  async function confirmBulkApply() {
    const selectedIds = Object.keys(rowSelection)
    try {
      await bulkMitarbeiterAction({ ids: selectedIds, action: "applyPosition", position: bulkPosition })
      await loadMitarbeiter()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply position")
    } finally {
      setRowSelection({})
      setBulkPosition("")
      setBulkApplyOpen(false)
    }
  }

  function handleBulkDelete() {
    setBulkDeleteOpen(true)
  }

  async function confirmBulkDelete() {
    const selectedIds = Object.keys(rowSelection)
    try {
      await bulkMitarbeiterAction({ ids: selectedIds, action: "delete" })
      await loadMitarbeiter()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    } finally {
      setRowSelection({})
      setBulkDeleteOpen(false)
    }
  }

  function resetForm() {
    setVorname("")
    setNachname("")
    setPersonalNr("")
    setPosition("")
    setErrors({})
  }

  async function handleSave() {
    const newErrors: { vorname?: string; nachname?: string } = {}

    if (!vorname.trim()) {
      newErrors.vorname = "Vorname ist ein Pflichtfeld."
    }
    if (!nachname.trim()) {
      newErrors.nachname = "Nachname ist ein Pflichtfeld."
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setSaving(true)
      if (editingId) {
        await updateMitarbeiter(editingId, {
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          personalNr: personalNr.trim() || null,
          position,
        })
      } else {
        await createMitarbeiter({
          id: crypto.randomUUID(),
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          personalNr: personalNr.trim() || null,
          position,
        })
      }
      await loadMitarbeiter()
      resetForm()
      setEditingId(null)
      setDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Mitarbeiter</h1>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus />
            Neuer Mitarbeiter
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen nach Vorname, Nachname oder Personal-Nr..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
              Schließen
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : mitarbeiter.length > 0 ? (
          <>
            {selectedCount > 0 && (
              <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
                <span className="text-sm font-medium">
                  {selectedCount} ausgewählt
                </span>
                <Select value={bulkPosition} onValueChange={setBulkPosition}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Position zuweisen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teamleiter">Teamleiter</SelectItem>
                    <SelectItem value="stv-teamleiter">Stv. Teamleiter</SelectItem>
                    <SelectItem value="anlagebediener">Anlagebediener</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleBulkApply}
                  disabled={!bulkPosition}
                >
                  Übernehmen
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  Löschen
                </Button>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm whitespace-nowrap text-muted-foreground">
                Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
              </span>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => table.previousPage()}
                      className={
                        !table.getCanPreviousPage()
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={table.getState().pagination.pageIndex === i}
                        onClick={() => table.setPageIndex(i)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => table.nextPage()}
                      className={
                        !table.getCanNextPage()
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>Keine Mitarbeiter</EmptyTitle>
              <EmptyDescription>
                Es wurden noch keine Mitarbeiter erstellt. Klicke auf den Button
                oben, um einen neuen Mitarbeiter hinzuzufügen.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Mitarbeiter bearbeiten" : "Neuer Mitarbeiter"}
            </DialogTitle>
            <DialogDescription>
              Pflichtfelder sind mit * markiert.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Field data-invalid={!!errors.vorname}>
              <FieldLabel htmlFor="vorname">
                Vorname <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="vorname"
                value={vorname}
                onChange={(e) => {
                  setVorname(e.target.value)
                  if (errors.vorname) setErrors((p) => ({ ...p, vorname: undefined }))
                }}
                aria-invalid={!!errors.vorname}
              />
              {errors.vorname && <FieldError>{errors.vorname}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.nachname}>
              <FieldLabel htmlFor="nachname">
                Nachname <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="nachname"
                value={nachname}
                onChange={(e) => {
                  setNachname(e.target.value)
                  if (errors.nachname) setErrors((p) => ({ ...p, nachname: undefined }))
                }}
                aria-invalid={!!errors.nachname}
              />
              {errors.nachname && <FieldError>{errors.nachname}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="personalNr">Personal-Nr</FieldLabel>
              <Input
                id="personalNr"
                value={personalNr}
                onChange={(e) => setPersonalNr(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="position">Position</FieldLabel>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger id="position" className="w-full">
                  <SelectValue placeholder="Position auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teamleiter">Teamleiter</SelectItem>
                  <SelectItem value="stv-teamleiter">Stv. Teamleiter</SelectItem>
                  <SelectItem value="anlagebediener">Anlagebediener</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="gap-2" disabled={saving}>
              <Save />
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Mitarbeiter wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkApplyOpen} onOpenChange={setBulkApplyOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Position zuweisen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die ausgewählte Position allen {selectedCount} markierten Mitarbeitern zuweisen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBulkApplyOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={confirmBulkApply}>
              Übernehmen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die {selectedCount} ausgewählten Mitarbeiter wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type Abteilung = {
  id: string
  name: string
}

type Fehlercode = {
  id: string
  code: string
  beschreibung: string
  abteilungId: string | null
}

function useDataTable<T>(data: T[], initialPageSize = 5) {
  const [search, setSearch] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})

  const [editFallId, setEditFallId] = React.useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteFallId, setDeleteFallId] = React.useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  return {
    search,
    setSearch,
    sorting,
    setSorting,
    pagination,
    setPagination,
  }
}

function FehlercodesPage() {
  const [abteilungenOpen, setAbteilungenOpen] = React.useState(false)

  const [abteilungen, setAbteilungen] = React.useState<ApiAbteilung[]>([])
  const abteilungTableState = useDataTable<ApiAbteilung>(abteilungen)
  const [abteilungName, setAbteilungName] = React.useState("")
  const [abteilungNameError, setAbteilungNameError] = React.useState<string | null>(null)
  const [editingAbteilungId, setEditingAbteilungId] = React.useState<string | null>(null)
  const [deleteAbteilungId, setDeleteAbteilungId] = React.useState<string | null>(null)
  const [abteilungDialogOpen, setAbteilungDialogOpen] = React.useState(false)

  const [fehlercodes, setFehlercodes] = React.useState<ApiFehlercode[]>([])
  const [activeTab, setActiveTab] = React.useState("unassigned")
  const fehlercodeTableState = useDataTable<ApiFehlercode>(fehlercodes, 10)
  const [fehlercodeDialogOpen, setFehlercodeDialogOpen] = React.useState(false)
  const [editingFehlercodeId, setEditingFehlercodeId] = React.useState<string | null>(null)
  const [deleteFehlercodeId, setDeleteFehlercodeId] = React.useState<string | null>(null)

  const [fcCode, setFcCode] = React.useState("")
  const [fcBeschreibung, setFcBeschreibung] = React.useState("")
  const [fcAbteilungId, setFcAbteilungId] = React.useState("")
  const [fcErrors, setFcErrors] = React.useState<{ code?: string; beschreibung?: string }>({})

  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)
  const [bulkAssignOpen, setBulkAssignOpen] = React.useState(false)
  const [bulkAssignDepartment, setBulkAssignDepartment] = React.useState("")

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const selectedFehlercodeCount = Object.keys(rowSelection).length

  React.useEffect(() => {
    setRowSelection({})
  }, [activeTab])

  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const [abtData, fcData] = await Promise.all([fetchAbteilungen(), fetchFehlercodes()])
      setAbteilungen(abtData)
      setFehlercodes(fcData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const abteilungColumns: ColumnDef<ApiAbteilung>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Abteilung
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        id: "actions",
        header: "Aktionen",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => openEditAbteilung(row.original)}>
              <Pencil />
              <span className="sr-only">Bearbeiten</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteAbteilungId(row.original.id)}>
              <Trash2 />
              <span className="sr-only">Löschen</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const filteredAbteilungen = React.useMemo(() => {
    const query = abteilungTableState.search.toLowerCase().trim()
    if (!query) return abteilungen
    return abteilungen.filter((a) => a.name.toLowerCase().includes(query))
  }, [abteilungen, abteilungTableState.search])

  const abteilungTable = useReactTable({
    data: filteredAbteilungen,
    columns: abteilungColumns,
    state: {
      sorting: abteilungTableState.sorting,
      pagination: abteilungTableState.pagination,
    },
    onSortingChange: abteilungTableState.setSorting,
    onPaginationChange: abteilungTableState.setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  })

  const fehlercodeColumns: ColumnDef<ApiFehlercode>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="rounded-none"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="rounded-none"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Zeile auswählen"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Code
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "beschreibung",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Beschreibung
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "departmentId",
        header: "Abteilung",
        cell: ({ row }) => {
          if (!row.original.departmentId) return "Nicht zugeordnet"
          const abt = abteilungen.find((a) => a.id === row.original.departmentId)
          return abt?.name || "Nicht zugeordnet"
        },
      },
      {
        id: "actions",
        header: "Aktionen",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => openEditFehlercode(row.original)}>
              <Pencil />
              <span className="sr-only">Bearbeiten</span>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteFehlercodeId(row.original.id)}>
              <Trash2 />
              <span className="sr-only">Löschen</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [abteilungen]
  )

  const filteredFehlercodes = React.useMemo(() => {
    let result = fehlercodes
    if (activeTab !== "all") {
      result = result.filter((f) =>
        activeTab === "unassigned" ? f.departmentId === null : f.departmentId === activeTab
      )
    }
    const query = fehlercodeTableState.search.toLowerCase().trim()
    if (!query) return result
    return result.filter(
      (f) =>
        f.code?.toLowerCase().includes(query) ||
        f.beschreibung.toLowerCase().includes(query)
    )
  }, [fehlercodes, activeTab, fehlercodeTableState.search])

  const fehlercodeTable = useReactTable({
    data: filteredFehlercodes,
    columns: fehlercodeColumns,
    state: {
      sorting: fehlercodeTableState.sorting,
      pagination: fehlercodeTableState.pagination,
      rowSelection,
    },
    onSortingChange: fehlercodeTableState.setSorting,
    onPaginationChange: fehlercodeTableState.setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })

  function openCreateAbteilung() {
    setAbteilungName("")
    setAbteilungNameError(null)
    setEditingAbteilungId(null)
    setAbteilungDialogOpen(true)
  }

  function openEditAbteilung(abteilung: ApiAbteilung) {
    setAbteilungName(abteilung.name)
    setAbteilungNameError(null)
    setEditingAbteilungId(abteilung.id)
    setAbteilungDialogOpen(true)
  }

  async function saveAbteilung() {
    if (!abteilungName.trim()) {
      setAbteilungNameError("Abteilung ist ein Pflichtfeld.")
      return
    }
    try {
      setSaving(true)
      if (editingAbteilungId) {
        await updateAbteilung(editingAbteilungId, { name: abteilungName.trim() })
      } else {
        await createAbteilung({ id: crypto.randomUUID(), name: abteilungName.trim() })
      }
      await loadData()
      setAbteilungName("")
      setAbteilungNameError(null)
      setEditingAbteilungId(null)
      setAbteilungDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save department")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDeleteAbteilung() {
    if (!deleteAbteilungId) return
    try {
      await deleteAbteilungApi(deleteAbteilungId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete department")
    } finally {
      setDeleteAbteilungId(null)
    }
  }

  function openCreateFehlercode() {
    setFcCode("")
    setFcBeschreibung("")
    setFcErrors({})
    if (activeTab === "unassigned") {
      setFcAbteilungId(UNASSIGNED_VALUE)
    } else if (activeTab !== "all") {
      setFcAbteilungId(activeTab)
    } else {
      setFcAbteilungId(UNASSIGNED_VALUE)
    }
    setEditingFehlercodeId(null)
    setFehlercodeDialogOpen(true)
  }

  function openEditFehlercode(fehlercode: ApiFehlercode) {
    setFcCode(fehlercode.code ?? "")
    setFcBeschreibung(fehlercode.beschreibung)
    setFcAbteilungId(fehlercode.departmentId || UNASSIGNED_VALUE)
    setFcErrors({})
    setEditingFehlercodeId(fehlercode.id)
    setFehlercodeDialogOpen(true)
  }

  async function saveFehlercode() {
    const errors: { code?: string; beschreibung?: string } = {}
    if (!fcCode.trim()) errors.code = "Code ist ein Pflichtfeld."
    if (!fcBeschreibung.trim()) errors.beschreibung = "Beschreibung ist ein Pflichtfeld."
    if (Object.keys(errors).length > 0) {
      setFcErrors(errors)
      return
    }
    const departmentId = fcAbteilungId === UNASSIGNED_VALUE ? null : fcAbteilungId
    const data = {
      code: fcCode.trim(),
      beschreibung: fcBeschreibung.trim(),
      departmentId,
    }
    try {
      setSaving(true)
      if (editingFehlercodeId) {
        await updateFehlercode(editingFehlercodeId, data)
      } else {
        await createFehlercode({ id: crypto.randomUUID(), ...data })
      }
      await loadData()
      setFcCode("")
      setFcBeschreibung("")
      setFcAbteilungId(UNASSIGNED_VALUE)
      setFcErrors({})
      setEditingFehlercodeId(null)
      setFehlercodeDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save error code")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDeleteFehlercode() {
    if (!deleteFehlercodeId) return
    try {
      await deleteFehlercodeApi(deleteFehlercodeId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete error code")
    } finally {
      setDeleteFehlercodeId(null)
    }
  }

  function handleBulkDeleteFehlercodes() {
    setBulkDeleteOpen(true)
  }

  async function confirmBulkDeleteFehlercodes() {
    const selectedIds = Object.keys(rowSelection)
    try {
      await bulkDeleteFehlercodes(selectedIds)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete error codes")
    } finally {
      setRowSelection({})
      setBulkDeleteOpen(false)
    }
  }

  function handleBulkAssign() {
    if (!bulkAssignDepartment) return
    setBulkAssignOpen(true)
  }

  async function confirmBulkAssign() {
    const selectedIds = Object.keys(rowSelection)
    const departmentId = bulkAssignDepartment === UNASSIGNED_VALUE ? null : bulkAssignDepartment
    try {
      await bulkAssignFehlercodes(selectedIds, departmentId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign department")
    } finally {
      setRowSelection({})
      setBulkAssignDepartment("")
      setBulkAssignOpen(false)
    }
  }

  const tabOptions = [
    { value: "unassigned", label: "Nicht zugeordnet" },
    ...abteilungen.map((a) => ({ value: a.id, label: a.name })),
  ]

  function renderFehlercodeTable() {
    if (filteredFehlercodes.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircle />
            </EmptyMedia>
            <EmptyTitle>Keine Fehlercodes</EmptyTitle>
            <EmptyDescription>
              Es wurden noch keine Fehlercodes erstellt.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )
    }
    return (
      <>
        {selectedFehlercodeCount > 0 && (
          <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
            <span className="text-sm font-medium">
              {selectedFehlercodeCount} ausgewählt
            </span>
            <Select value={bulkAssignDepartment} onValueChange={setBulkAssignDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Abteilung zuweisen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED_VALUE}>Nicht zugeordnet</SelectItem>
                {abteilungen.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleBulkAssign}
              disabled={!bulkAssignDepartment}
            >
              Zuweisen
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDeleteFehlercodes}
            >
              Löschen
            </Button>
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {fehlercodeTable.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {fehlercodeTable.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm whitespace-nowrap text-muted-foreground">
            Seite {fehlercodeTable.getState().pagination.pageIndex + 1} von{" "}
            {fehlercodeTable.getPageCount()}
          </span>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => fehlercodeTable.previousPage()}
                  className={!fehlercodeTable.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: fehlercodeTable.getPageCount() }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={fehlercodeTable.getState().pagination.pageIndex === i}
                    onClick={() => fehlercodeTable.setPageIndex(i)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => fehlercodeTable.nextPage()}
                  className={!fehlercodeTable.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Fehlercodes</h1>
          <p className="text-muted-foreground">
            Verwalte Fehlercodes und Abteilungen für dein Unternehmen.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="gap-2" onClick={() => setAbteilungenOpen(true)}>
            <Building2 />
            Abteilungen
          </Button>
          <Button className="gap-2" onClick={openCreateFehlercode}>
            <FilePlus />
            Fehlercode hinzufügen
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
              Schließen
            </Button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Fehlercode oder Beschreibung suchen..."
            value={fehlercodeTableState.search}
            onChange={(e) => fehlercodeTableState.setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            {tabOptions.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabOptions.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="flex flex-col gap-4">
              {renderFehlercodeTable()}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Abteilungen Dialog */}
      <Dialog open={abteilungenOpen} onOpenChange={setAbteilungenOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Abteilungen verwalten</DialogTitle>
            <DialogDescription>Erstelle, bearbeite und lösche Abteilungen.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Button onClick={openCreateAbteilung} className="w-fit gap-2">
              <Plus />
              Abteilung hinzufügen
            </Button>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Abteilung suchen..."
                value={abteilungTableState.search}
                onChange={(e) => abteilungTableState.setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {abteilungen.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {abteilungTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {abteilungTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm whitespace-nowrap text-muted-foreground">
                    Seite {abteilungTable.getState().pagination.pageIndex + 1} von{" "}
                    {abteilungTable.getPageCount()}
                  </span>
                  <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => abteilungTable.previousPage()}
                          className={!abteilungTable.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: abteilungTable.getPageCount() }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={abteilungTable.getState().pagination.pageIndex === i}
                            onClick={() => abteilungTable.setPageIndex(i)}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => abteilungTable.nextPage()}
                          className={!abteilungTable.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Building2 />
                  </EmptyMedia>
                  <EmptyTitle>Keine Abteilungen</EmptyTitle>
                  <EmptyDescription>Es wurden noch keine Abteilungen erstellt.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Abteilung Create/Edit Dialog */}
      <Dialog open={abteilungDialogOpen} onOpenChange={setAbteilungDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAbteilungId ? "Abteilung bearbeiten" : "Abteilung hinzufügen"}</DialogTitle>
            <DialogDescription>Gib den Namen der Abteilung ein.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-2">
            <Label htmlFor="abteilung-name">
              Abteilung <span className="text-destructive">*</span>
            </Label>
            <Input
              id="abteilung-name"
              value={abteilungName}
              onChange={(e) => {
                setAbteilungName(e.target.value)
                if (abteilungNameError) setAbteilungNameError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveAbteilung()
              }}
            />
            {abteilungNameError && <p className="text-sm text-destructive">{abteilungNameError}</p>}
          </div>
          <DialogFooter>
            <Button onClick={saveAbteilung} className="gap-2" disabled={saving}>
              <Save />
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Abteilung Delete AlertDialog */}
      <AlertDialog open={!!deleteAbteilungId} onOpenChange={() => setDeleteAbteilungId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Abteilung löschen</AlertDialogTitle>
            <AlertDialogDescription>Möchtest du diese Abteilung wirklich löschen?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteAbteilungId(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDeleteAbteilung}>
              Löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fehlercode Create/Edit Dialog */}
      <Dialog open={fehlercodeDialogOpen} onOpenChange={setFehlercodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFehlercodeId ? "Fehlercode bearbeiten" : "Fehlercode hinzufügen"}</DialogTitle>
            <DialogDescription>Pflichtfelder sind mit * markiert.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fc-code">
                Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fc-code"
                value={fcCode}
                onChange={(e) => {
                  setFcCode(e.target.value)
                  if (fcErrors.code) setFcErrors((p) => ({ ...p, code: undefined }))
                }}
              />
              {fcErrors.code && <p className="text-sm text-destructive">{fcErrors.code}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fc-beschreibung">
                Beschreibung <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fc-beschreibung"
                value={fcBeschreibung}
                onChange={(e) => {
                  setFcBeschreibung(e.target.value)
                  if (fcErrors.beschreibung) setFcErrors((p) => ({ ...p, beschreibung: undefined }))
                }}
              />
              {fcErrors.beschreibung && <p className="text-sm text-destructive">{fcErrors.beschreibung}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fc-abteilung">Abteilung</Label>
              <Select value={fcAbteilungId} onValueChange={setFcAbteilungId}>
                <SelectTrigger id="fc-abteilung">
                  <SelectValue placeholder="Abteilung auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_VALUE}>Nicht zugeordnet</SelectItem>
                  {abteilungen.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveFehlercode} className="gap-2" disabled={saving}>
              <Save />
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fehlercode Delete AlertDialog */}
      <AlertDialog open={!!deleteFehlercodeId} onOpenChange={() => setDeleteFehlercodeId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Fehlercode löschen</AlertDialogTitle>
            <AlertDialogDescription>Möchtest du diesen Fehlercode wirklich löschen?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteFehlercodeId(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDeleteFehlercode}>
              Löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fehlercode Bulk Delete AlertDialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Fehlercodes löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die ausgewählten Fehlercodes wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmBulkDeleteFehlercodes}>
              Löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Fehlercode Bulk Assign AlertDialog */}
      <AlertDialog open={bulkAssignOpen} onOpenChange={setBulkAssignOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Abteilung zuweisen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du den ausgewählten Fehlercodes diese Abteilung zuweisen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setBulkAssignOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={confirmBulkAssign}>
              Zuweisen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

async function searchCsvAuftraegeByFauf(fauf: string): Promise<ApiCsvAuftrag[]> {
  const res = await fetch(`/api/csv-auftraege?fauf=${encodeURIComponent(fauf)}`)
  if (!res.ok) throw new Error("Failed to fetch CSV data")
  return res.json()
}

async function fetchMaterialien(): Promise<ApiMaterial[]> {
  const res = await fetch("/api/materialien")
  if (!res.ok) throw new Error("Failed to fetch materials")
  return res.json()
}

async function createMaterial(data: { artikelNr: string; farbe: string }): Promise<ApiMaterial> {
  const res = await fetch("/api/materialien", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to create material")
  return res.json()
}

type ApiMaterial = {
  id: string
  artikelNr: string
  farbe: string
}

type ApiCsvAuftrag = {
  id: string
  kundenAuftrag: string
  artikelNr: string
  farbe: string
  fauf: string
}

type MaterialGruppe = {
  id: string
  materialId: string
  stueckzahl: string
  fehlercodeId: string
}

type FallFormProps = {
  editId?: string
  onSaved?: () => void
  onCancel?: () => void
  isAdmin?: boolean
}

function FallErfassenPage({ editId, onSaved, onCancel, isAdmin = false }: FallFormProps = {}) {
  const [maschine, setMaschine] = React.useState("")
  const [falltyp, setFalltyp] = React.useState("ausschuss")
  const [fauf, setFauf] = React.useState("")
  const [kundenAuftrag, setKundenAuftrag] = React.useState("")
  const [materialGruppen, setMaterialGruppen] = React.useState<MaterialGruppe[]>([
    { id: crypto.randomUUID(), materialId: "", stueckzahl: "1", fehlercodeId: "" },
  ])
  const [kommentar, setKommentar] = React.useState("")
  const [mitarbeiterId, setMitarbeiterId] = React.useState("")
  const [verursacherId, setVerursacherId] = React.useState("")
  const [createdAt, setCreatedAt] = React.useState("")
  const [createdAtDisplay, setCreatedAtDisplay] = React.useState("")
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [createdAtError, setCreatedAtError] = React.useState("")

  const [fehlercodesList, setFehlercodesList] = React.useState<ApiFehlercode[]>([])
  const [abteilungenList, setAbteilungenList] = React.useState<ApiAbteilung[]>([])
  const [mitarbeiterList, setMitarbeiterList] = React.useState<Mitarbeiter[]>([])
  const [materialienList, setMaterialienList] = React.useState<ApiMaterial[]>([])
  const [loading, setLoading] = React.useState(true)

  const [errors, setErrors] = React.useState<{
    maschine?: string
    materialGruppen?: string
    mitarbeiterId?: string
  }>({})

  const [saving, setSaving] = React.useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false)

  const [fehlercodeOpenMap, setFehlercodeOpenMap] = React.useState<Record<string, boolean>>({})
  const [materialOpenMap, setMaterialOpenMap] = React.useState<Record<string, boolean>>({})
  const [mitarbeiterOpen, setMitarbeiterOpen] = React.useState(false)
  const [verursacherOpen, setVerursacherOpen] = React.useState(false)
  const [faufMaterialIds, setFaufMaterialIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [fcData, abtData, mData, matData] = await Promise.all([
          fetchFehlercodes(),
          fetchAbteilungen(),
          fetchMitarbeiter(),
          fetchMaterialien(),
        ])
        setFehlercodesList(fcData)
        setAbteilungenList(abtData)
        setMitarbeiterList(mData)
        setMaterialienList(matData)

        if (editId) {
          const res = await fetch(`/api/faelle/${editId}`)
          if (res.ok) {
            const fall = await res.json()
            setMaschine(fall.maschine)
            setFalltyp(fall.fallTyp)
            setFauf(fall.fauf || "")
            setKundenAuftrag(fall.kundenAuftrag || "")
            setKommentar(fall.kommentar || "")
            setMitarbeiterId(fall.mitarbeiterId)
            setVerursacherId(fall.verursacherId || "")
            if (fall.createdAt) {
              const d = new Date(fall.createdAt)
              const pad = (n: number) => String(n).padStart(2, "0")
              setCreatedAt(
                `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
              )
              setCreatedAtDisplay(
                `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
              )
            }
            if (fall.positionen && fall.positionen.length > 0) {
              setMaterialGruppen(
                fall.positionen.map((p: any) => ({
                  id: p.id,
                  materialId: p.materialId,
                  stueckzahl: String(p.stueckzahl),
                  fehlercodeId: p.fehlercodeId || "",
                }))
              )
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [editId])

  function normalizeKundenAuftrag(value: string): string {
    const dotIndex = value.indexOf(".")
    return dotIndex === -1 ? value : value.slice(0, dotIndex)
  }

  async function lookupFauf(query: string) {
    if (!query.trim()) {
      setKundenAuftrag("")
      setFaufMaterialIds(new Set())
      setMaterialGruppen([{ id: crypto.randomUUID(), materialId: "", stueckzahl: "1", fehlercodeId: "" }])
      return
    }
    try {
      const results = await searchCsvAuftraegeByFauf(query.trim())
      const faufIds = new Set<string>()
      for (const r of results) {
        const mat = materialienList.find(
          (m) => m.artikelNr === r.artikelNr && m.farbe === r.farbe
        )
        if (mat) faufIds.add(mat.id)
      }
      setFaufMaterialIds(faufIds)

      if (results.length === 0) {
        setKundenAuftrag("")
        setMaterialGruppen([{ id: crypto.randomUUID(), materialId: "", stueckzahl: "1", fehlercodeId: "" }])
      } else {
        const first = results[0]
        setKundenAuftrag(normalizeKundenAuftrag(first.kundenAuftrag))
        const firstMat = materialienList.find(
          (m) => m.artikelNr === first.artikelNr && m.farbe === first.farbe
        )
        setMaterialGruppen([{
          id: crypto.randomUUID(),
          materialId: firstMat?.id || "",
          stueckzahl: "1",
          fehlercodeId: "",
        }])
      }
    } catch {
      setKundenAuftrag("")
      setFaufMaterialIds(new Set())
      setMaterialGruppen([{ id: crypto.randomUUID(), materialId: "", stueckzahl: "1", fehlercodeId: "" }])
    }
  }

  React.useEffect(() => {
    if (editId) return
    const timer = setTimeout(() => lookupFauf(fauf), 300)
    return () => clearTimeout(timer)
  }, [editId, fauf, materialienList])

  function addMaterialGruppe() {
    setMaterialGruppen((prev) => [...prev, { id: crypto.randomUUID(), materialId: "", stueckzahl: "1", fehlercodeId: "" }])
  }

  function removeMaterialGruppe(index: number) {
    setMaterialGruppen((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }

  function updateMaterialGruppe(index: number, updates: Partial<MaterialGruppe>) {
    setMaterialGruppen((prev) =>
      prev.map((g, i) => (i === index ? { ...g, ...updates } : g))
    )
  }

  const pad2 = (n: number) => String(n).padStart(2, "0")

  function isoToDisplay(iso: string): string {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ""
    return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  }

  function displayToIso(display: string): string | null {
    const m = display.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\s+(\d{1,2}):(\d{2})$/)
    if (!m) return null
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4]), Number(m[5]))
    if (isNaN(d.getTime())) return null
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  }

  function validate() {
    const newErrors: typeof errors = {}
    if (!maschine) newErrors.maschine = "Maschine ist erforderlich."
    const hasMissingMaterial = materialGruppen.some((g) => !g.materialId)
    if (hasMissingMaterial) {
      newErrors.materialGruppen = "Bitte ein vorhandenes Material auswählen."
    }
    const hasInvalidStueckzahl = materialGruppen.some((g) => {
      const num = Number(g.stueckzahl)
      return !g.stueckzahl || Number.isNaN(num) || num < 1
    })
    if (hasInvalidStueckzahl) {
      newErrors.materialGruppen = "Stückzahl muss mindestens 1 sein."
    }
    if (falltyp === "ausschuss") {
      const hasMissingFehlercode = materialGruppen.some((g) => !g.fehlercodeId)
      if (hasMissingFehlercode) {
        newErrors.materialGruppen = "Fehlercode ist für Ausschuss erforderlich."
      }
    }
    if (!mitarbeiterId) newErrors.mitarbeiterId = "Mitarbeiter ist erforderlich."
    if (createdAtDisplay && !createdAt) {
      setCreatedAtError("Ungültiges Datum (TT.MM.JJJJ HH:mm)")
    } else {
      setCreatedAtError("")
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

    try {
      setSaving(true)
      const payload = {
        maschine,
        fallTyp: falltyp,
        fauf: fauf || null,
        kundenAuftrag: kundenAuftrag || null,
        kommentar: kommentar || null,
        mitarbeiterId,
        verursacherId: verursacherId || null,
        ...(editId && createdAt ? { createdAt } : {}),
        positionen: materialGruppen.map((g) => ({
          id: g.id.startsWith("edit-") ? crypto.randomUUID() : g.id,
          materialId: g.materialId,
          stueckzahl: Number(g.stueckzahl),
          fehlercodeId: g.fehlercodeId || null,
        })),
      }

      const res = editId
        ? await fetch(`/api/faelle/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/faelle", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: crypto.randomUUID(), ...payload }),
          })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Speichern fehlgeschlagen")
      }

      if (!editId) {
        setMaschine("")
        setFalltyp("ausschuss")
        setFauf("")
        setKundenAuftrag("")
        setMaterialGruppen([
          { id: crypto.randomUUID(), materialId: "", stueckzahl: "1", fehlercodeId: "" },
        ])
        setKommentar("")
        setMitarbeiterId("")
        setVerursacherId("")
        setCreatedAt("")
        setCreatedAtDisplay("")
        setCreatedAtError("")
        setErrors({})
      }

      setSuccessDialogOpen(true)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        materialGruppen: err instanceof Error ? err.message : "Speichern fehlgeschlagen",
      }))
    } finally {
      setSaving(false)
    }
  }

  const selectedMitarbeiter = mitarbeiterList.find((m) => m.id === mitarbeiterId)

  const groupedFehlercodes = React.useMemo(() => {
    const deptMap = new Map(abteilungenList.map((a) => [a.id, a.name]))
    const groups = new Map<string, { name: string; items: ApiFehlercode[] }>()

    for (const fc of fehlercodesList) {
      const deptId = fc.departmentId || "unassigned"
      const deptName = deptMap.get(fc.departmentId || "") || "Ohne Abteilung"
      if (!groups.has(deptId)) {
        groups.set(deptId, { name: deptName, items: [] })
      }
      groups.get(deptId)!.items.push(fc)
    }

    const sorted = Array.from(groups.values())
    sorted.sort((a, b) => {
      if (a.name === "PV Bearbeitung") return -1
      if (b.name === "PV Bearbeitung") return 1
      return a.name.localeCompare(b.name)
    })

    return sorted
  }, [fehlercodesList, abteilungenList])

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Fall erfassen</h1>

      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Zeile 1: Maschine */}
          <Field data-invalid={!!errors.maschine}>
            <FieldLabel>Maschine</FieldLabel>
            <RadioGroup value={maschine} onValueChange={setMaschine} className="flex flex-wrap gap-4">
              {["Selco", "Schelling", "Homag", "Rover 2", "Rover 3", "Rover 4", "Unbekannt"].map((m) => (
                <div key={m} className="flex items-center gap-2">
                  <RadioGroupItem value={m} id={`maschine-${m}`} />
                  <Label htmlFor={`maschine-${m}`}>{m}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors.maschine && <FieldError>{errors.maschine}</FieldError>}
          </Field>

          {/* Zeile 2: Falltyp + FAUF + Kundenauftrag */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Field className="sm:w-[180px] shrink-0">
              <FieldLabel>Falltyp</FieldLabel>
              <Select value={falltyp} onValueChange={setFalltyp}>
                <SelectTrigger>
                  <SelectValue placeholder="Falltyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ausschuss">Ausschuss</SelectItem>
                  <SelectItem value="qproblem">Q-Problem</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field className="flex-1">
              <FieldLabel>FAUF</FieldLabel>
              <Input
                value={fauf}
                onChange={(e) => setFauf(e.target.value)}
                onBlur={() => lookupFauf(fauf)}
                placeholder="FAUF eingeben"
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel>Kundenauftrag</FieldLabel>
              <Input
                value={kundenAuftrag}
                onChange={(e) => setKundenAuftrag(e.target.value)}
                placeholder="Kundenauftrag"
              />
            </Field>
          </div>

          {/* Zeile 3: Materialnr / Stückzahl / Fehlercode Gruppen */}
          <div className="flex flex-col gap-4">
            {materialGruppen.map((gruppe, index) => {
              const selectedFc = fehlercodesList.find((f) => f.id === gruppe.fehlercodeId)
              const isOpen = fehlercodeOpenMap[gruppe.id] || false
              const selectedMat = materialienList.find((m) => m.id === gruppe.materialId)
              const matOpen = materialOpenMap[gruppe.id] || false
              const faufMaterials = materialienList.filter((m) => faufMaterialIds.has(m.id))
              const otherMaterials = materialienList.filter((m) => !faufMaterialIds.has(m.id))
              return (
                <div key={gruppe.id} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <Field className="sm:w-[400px] shrink-0">
                    <FieldLabel>Materialnr</FieldLabel>
                    <Popover
                      open={matOpen}
                      onOpenChange={(open) =>
                        setMaterialOpenMap((p) => ({ ...p, [gruppe.id]: open }))
                      }
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={matOpen}
                          className="w-[400px] justify-between"
                        >
                          <span className="truncate">
                            {selectedMat
                              ? `${selectedMat.artikelNr} (${selectedMat.farbe})`
                              : "Material auswählen"}
                          </span>
                          {selectedMat ? (
                            <span
                              role="button"
                              tabIndex={0}
                              className="ml-2 flex size-4 shrink-0 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateMaterialGruppe(index, { materialId: "" })
                                setMaterialOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation()
                                  updateMaterialGruppe(index, { materialId: "" })
                                  setMaterialOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                                }
                              }}
                            >
                              <X />
                            </span>
                          ) : (
                            <ChevronsUpDown />
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Material suchen..." />
                          <CommandList>
                            <CommandEmpty className="flex flex-col gap-2 p-2">
                              <span className="text-sm text-muted-foreground">
                                Kein Material gefunden.
                              </span>
                            </CommandEmpty>
                            {faufMaterials.length > 0 && (
                              <CommandGroup heading="Materialien aus FAUF">
                                {faufMaterials.map((m) => (
                                  <CommandItem
                                    key={m.id}
                                    value={`fauf-${m.artikelNr}-${m.farbe}`}
                                    onSelect={() => {
                                      updateMaterialGruppe(index, { materialId: m.id })
                                      setMaterialOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                                    }}
                                  >
                                    {m.artikelNr} ({m.farbe})
                                    {gruppe.materialId === m.id && <Check />}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                            {otherMaterials.length > 0 && (
                              <CommandGroup heading="Alle Materialien">
                                {otherMaterials.map((m) => (
                                  <CommandItem
                                    key={m.id}
                                    value={`all-${m.artikelNr}-${m.farbe}`}
                                    onSelect={() => {
                                      updateMaterialGruppe(index, { materialId: m.id })
                                      setMaterialOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                                    }}
                                  >
                                    {m.artikelNr} ({m.farbe})
                                    {gruppe.materialId === m.id && <Check />}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </Field>
                  <Field className="sm:w-[100px] shrink-0">
                    <FieldLabel>Stückzahl</FieldLabel>
                    <Input
                      type="number"
                      min={1}
                      value={gruppe.stueckzahl}
                      onChange={(e) => {
                        updateMaterialGruppe(index, { stueckzahl: e.target.value })
                        if (errors.materialGruppen) setErrors((p) => ({ ...p, materialGruppen: undefined }))
                      }}
                    />
                  </Field>
                  {falltyp === "ausschuss" && (
                    <Field className="sm:w-[280px] shrink-0">
                      <FieldLabel>Fehlercode</FieldLabel>
                      <Popover open={isOpen} onOpenChange={(open) => setFehlercodeOpenMap((p) => ({ ...p, [gruppe.id]: open }))}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isOpen}
                            className="w-full justify-between"
                          >
                            {selectedFc
                              ? selectedFc.code
                                ? `${selectedFc.code} - ${selectedFc.beschreibung}`
                                : selectedFc.beschreibung
                              : "Fehlercode auswählen"}
                            {selectedFc ? (
                              <span
                                role="button"
                                tabIndex={0}
                                className="ml-2 flex size-4 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateMaterialGruppe(index, { fehlercodeId: "" })
                                  setFehlercodeOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.stopPropagation()
                                    updateMaterialGruppe(index, { fehlercodeId: "" })
                                    setFehlercodeOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                                  }
                                }}
                              >
                                <X />
                              </span>
                            ) : (
                              <ChevronsUpDown />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Fehlercode suchen..." />
                            <CommandList>
                              <CommandEmpty>Kein Fehlercode gefunden.</CommandEmpty>
                              {groupedFehlercodes.map((group) => (
                                <CommandGroup key={group.name} heading={group.name}>
                                  {group.items.map((fc) => (
                                    <CommandItem
                                      key={fc.id}
                                      value={`${fc.code ?? ""} ${fc.beschreibung}`}
                                      onSelect={() => {
                                        updateMaterialGruppe(index, { fehlercodeId: fc.id })
                                        setFehlercodeOpenMap((p) => ({ ...p, [gruppe.id]: false }))
                                      }}
                                    >
                                      {fc.code ? `${fc.code} - ${fc.beschreibung}` : fc.beschreibung}
                                      {gruppe.fehlercodeId === fc.id && <Check />}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </Field>
                  )}
                  <div className="flex items-center gap-1">
                    {index === materialGruppen.length - 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Material hinzufügen"
                        onClick={addMaterialGruppe}
                      >
                        <Plus />
                      </Button>
                    )}
                    {materialGruppen.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Material entfernen"
                        onClick={() => removeMaterialGruppe(index)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            {errors.materialGruppen && (
              <FieldError>{errors.materialGruppen}</FieldError>
            )}
          </div>

          {/* Zeile 4: Kommentar */}
          <Field>
            <FieldLabel>Kommentar / Beschreibung</FieldLabel>
            <Textarea
              value={kommentar}
              onChange={(e) => setKommentar(e.target.value)}
              placeholder="Kommentar eingeben..."
              rows={4}
            />
          </Field>

          {editId && (
            <Field data-invalid={!!createdAtError}>
              <FieldLabel>Datum</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="TT.MM.JJJJ HH:mm"
                  value={createdAtDisplay}
                  onChange={(e) => {
                    setCreatedAtDisplay(e.target.value)
                    setCreatedAtError("")
                    const iso = displayToIso(e.target.value)
                    if (iso) {
                      setCreatedAt(iso)
                    } else if (e.target.value === "") {
                      setCreatedAt("")
                    }
                  }}
                  className="w-[180px]"
                />
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <CalendarIcon className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={createdAt ? new Date(createdAt) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const existing = createdAt ? new Date(createdAt) : new Date()
                          date.setHours(existing.getHours(), existing.getMinutes(), 0, 0)
                          const iso = `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
                          setCreatedAt(iso)
                          setCreatedAtDisplay(
                            `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
                          )
                          setCreatedAtError("")
                        }
                      }}
                    />
                    <div className="flex items-center justify-center gap-2 border-t px-3 py-2">
                      <label className="text-xs text-muted-foreground shrink-0">Zeit</label>
                      <Input
                        placeholder="HH:mm"
                        value={
                          createdAt
                            ? `${pad2(new Date(createdAt).getHours())}:${pad2(new Date(createdAt).getMinutes())}`
                            : ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                          const match = val.match(/^(\d{1,2}):(\d{2})$/)
                          if (match) {
                            const hh = Number(match[1])
                            const mm = Number(match[2])
                            if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
                              const d = createdAt ? new Date(createdAt) : new Date()
                              d.setHours(hh, mm, 0, 0)
                              const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
                              setCreatedAt(iso)
                              setCreatedAtDisplay(
                                `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
                              )
                              setCreatedAtError("")
                            }
                          }
                        }}
                        className="h-8 w-[72px] px-2 text-center font-mono text-sm"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {createdAtError && <FieldError>{createdAtError}</FieldError>}
            </Field>
          )}

          {/* Zeile 7: Mitarbeiter + Verursacher */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Field data-invalid={!!errors.mitarbeiterId} className="w-[280px]">
              <FieldLabel>
                Mitarbeiter <span className="text-destructive">*</span>
              </FieldLabel>
              <Popover open={mitarbeiterOpen} onOpenChange={setMitarbeiterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={mitarbeiterOpen}
                    className="w-[280px] justify-between"
                  >
                    <span className="truncate">
                      {selectedMitarbeiter
                        ? `${selectedMitarbeiter.vorname} ${selectedMitarbeiter.nachname}`
                        : "Mitarbeiter auswählen"}
                    </span>
                    {selectedMitarbeiter ? (
                      <span
                        role="button"
                        tabIndex={0}
                        className="ml-2 flex size-4 shrink-0 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          setMitarbeiterId("")
                          setMitarbeiterOpen(false)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation()
                            setMitarbeiterId("")
                            setMitarbeiterOpen(false)
                          }
                        }}
                      >
                        <X />
                      </span>
                    ) : (
                      <ChevronsUpDown />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0">
                  <Command>
                    <CommandInput placeholder="Mitarbeiter suchen..." />
                    <CommandList>
                      <CommandEmpty>Kein Mitarbeiter gefunden.</CommandEmpty>
                      <CommandGroup>
                        {mitarbeiterList.map((m) => (
                          <CommandItem
                            key={m.id}
                            value={`${m.vorname} ${m.nachname} ${m.personalNr || ""}`}
                            onSelect={() => {
                              setMitarbeiterId(m.id)
                              setMitarbeiterOpen(false)
                              if (errors.mitarbeiterId) setErrors((p) => ({ ...p, mitarbeiterId: undefined }))
                            }}
                          >
                            {m.vorname} {m.nachname}
                            {mitarbeiterId === m.id && <Check />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.mitarbeiterId && <FieldError>{errors.mitarbeiterId}</FieldError>}
            </Field>

            {(isAdmin || editId) && (
              <Field className="w-[280px]">
                <FieldLabel>Verursacher</FieldLabel>
                <Popover open={verursacherOpen} onOpenChange={setVerursacherOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={verursacherOpen}
                      className="w-[280px] justify-between"
                    >
                      <span className="truncate">
                        {verursacherId
                          ? (() => {
                              const v = mitarbeiterList.find((m) => m.id === verursacherId)
                              return v ? `${v.vorname} ${v.nachname}` : "Verursacher auswählen"
                            })()
                          : "Verursacher auswählen"}
                      </span>
                      {verursacherId ? (
                        <span
                          role="button"
                          tabIndex={0}
                          className="ml-2 flex size-4 shrink-0 items-center justify-center rounded-sm opacity-50 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation()
                            setVerursacherId("")
                            setVerursacherOpen(false)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation()
                              setVerursacherId("")
                              setVerursacherOpen(false)
                            }
                          }}
                        >
                          <X />
                        </span>
                      ) : (
                        <ChevronsUpDown />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0">
                    <Command>
                      <CommandInput placeholder="Verursacher suchen..." />
                      <CommandList>
                        <CommandEmpty>Kein Mitarbeiter gefunden.</CommandEmpty>
                        <CommandGroup>
                          {mitarbeiterList.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={`${m.vorname} ${m.nachname} ${m.personalNr || ""}`}
                              onSelect={() => {
                                setVerursacherId(m.id)
                                setVerursacherOpen(false)
                              }}
                            >
                              {m.vorname} {m.nachname}
                              {verursacherId === m.id && <Check />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </Field>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" className="w-fit" disabled={saving}>
              {saving ? "Speichern..." : editId ? "Änderungen speichern" : "Fall speichern"}
            </Button>
            {editId && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
            )}
          </div>

          <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
            <AlertDialogContent className="sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Fall gespeichert</AlertDialogTitle>
                <AlertDialogDescription>
                  Der Fall wurde erfolgreich gespeichert.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  onClick={() => {
                    setSuccessDialogOpen(false)
                    if (onSaved) onSaved()
                  }}
                >
                  OK
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      )}
    </main>
  )
}

type ApiUebersichtRow = {
  fallId: string
  createdAt: string
  fallTyp: string
  fauf: string | null
  kundenAuftrag: string | null
  artikelNr: string
  farbe: string
  stueckzahl: number
  fehlercodeId: string | null
  code: string | null
  beschreibung: string | null
  abteilungName: string | null
  verursacherVorname: string | null
  verursacherNachname: string | null
}

async function fetchFaelle(): Promise<ApiUebersichtRow[]> {
  const res = await fetch("/api/faelle")
  if (!res.ok) throw new Error("Failed to fetch cases")
  return res.json()
}

async function deleteFall(id: string) {
  const res = await fetch(`/api/faelle/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete case")
}

async function bulkDeleteFaelle(ids: string[]) {
  const res = await fetch("/api/faelle/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error("Failed to delete cases")
}

function UebersichtPage() {
  const [data, setData] = React.useState<ApiUebersichtRow[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})

  const [editFallId, setEditFallId] = React.useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  const [deleteFallId, setDeleteFallId] = React.useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFaelle()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const filteredData = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return data
    return data.filter((row) => {
      const material = `${row.artikelNr} (${row.farbe})`.toLowerCase()
      const code = row.code?.toLowerCase() || row.beschreibung?.toLowerCase() || ""
      const verursacher = `${row.verursacherVorname ?? ""} ${row.verursacherNachname ?? ""}`.toLowerCase()
      return (
        (row.fauf?.toLowerCase().includes(query) ?? false) ||
        (row.kundenAuftrag?.toLowerCase().includes(query) ?? false) ||
        material.includes(query) ||
        code.includes(query) ||
        (row.abteilungName?.toLowerCase().includes(query) ?? false) ||
        verursacher.includes(query)
      )
    })
  }, [data, searchQuery])

  const columns: ColumnDef<ApiUebersichtRow>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="rounded-none"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="rounded-none"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Zeile auswählen"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Zeit
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => {
          const val = row.getValue("createdAt") as string
          return new Date(val).toLocaleString("de-DE")
        },
      },
      {
        accessorKey: "fallTyp",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Falltyp
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => {
          const val = row.getValue("fallTyp") as string
          return val === "ausschuss" ? "Ausschuss" : "Q-Problem"
        },
      },
      {
        accessorKey: "fauf",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            FAUF
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => (row.getValue("fauf") as string | null) || "-",
      },
      {
        accessorKey: "kundenAuftrag",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Kundenauftrag
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => (row.getValue("kundenAuftrag") as string | null) || "-",
      },
      {
        accessorKey: "material",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Material
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => `${row.artikelNr} (${row.farbe})`,
      },
      {
        accessorKey: "stueckzahl",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Stückzahl
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Code
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => {
          if (!row.fehlercodeId) return "-"
          if (row.code) return `${row.code} - ${row.beschreibung}`
          return row.beschreibung
        },
      },
      {
        accessorKey: "abteilung",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Abteilung
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => row.abteilungName || "-",
      },
      {
        accessorKey: "verursacher",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Verursacher
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => {
          if (row.verursacherVorname) return `${row.verursacherVorname} ${row.verursacherNachname}`
          return "-"
        },
      },
      {
        id: "actions",
        header: "Aktionen",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditFallId(row.original.fallId)
                setEditDialogOpen(true)
              }}
            >
              <Pencil />
              <span className="sr-only">Bearbeiten</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteFallId(row.original.fallId)}
            >
              <Trash2 />
              <span className="sr-only">Löschen</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row, index) => `${row.fallId}-${index}`,
    enableRowSelection: true,
  })

  const selectedFallIds = React.useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows
    const ids = new Set<string>()
    for (const row of selectedRows) {
      ids.add(row.original.fallId)
    }
    return Array.from(ids)
  }, [rowSelection])

  const selectedCount = selectedFallIds.length

  async function confirmDeleteFall() {
    if (!deleteFallId) return
    try {
      await deleteFall(deleteFallId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen")
    } finally {
      setDeleteFallId(null)
    }
  }

  function handleBulkDelete() {
    if (selectedCount === 0) return
    setBulkDeleteOpen(true)
  }

  async function confirmBulkDelete() {
    try {
      await bulkDeleteFaelle(selectedFallIds)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen")
    } finally {
      setRowSelection({})
      setBulkDeleteOpen(false)
    }
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Übersicht</h1>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
              Schließen
            </Button>
          </div>
        )}

        <div className="relative">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen nach FAUF, Kundenauftrag, Material oder Code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : data.length > 0 ? (
          <>
            {selectedCount > 0 && (
              <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
                <span className="text-sm font-medium">
                  {selectedCount} Fall{selectedCount !== 1 ? "e" : ""} ausgewählt
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  Löschen
                </Button>
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm whitespace-nowrap text-muted-foreground">
                Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
              </span>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => table.previousPage()}
                      className={
                        !table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={table.getState().pagination.pageIndex === i}
                        onClick={() => table.setPageIndex(i)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => table.nextPage()}
                      className={
                        !table.getCanNextPage() ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>Keine Fälle</EmptyTitle>
              <EmptyDescription>
                Es wurden noch keine Fälle erfasst. Wechsle zu "Fall erfassen", um einen neuen Fall zu speichern.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </main>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fall bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Fall-Daten und speichere die Änderungen.
            </DialogDescription>
          </DialogHeader>
          {editFallId && (
            <FallErfassenPage
              editId={editFallId}
              isAdmin
              onSaved={() => {
                setEditDialogOpen(false)
                setEditFallId(null)
                loadData()
              }}
              onCancel={() => {
                setEditDialogOpen(false)
                setEditFallId(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteFallId} onOpenChange={() => setDeleteFallId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Fall löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Fall wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFallId(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteFall}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Fälle löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die {selectedCount} ausgewählten Fälle wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteOpen(false)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmBulkDelete}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

type DashboardData = {
  pvBearbeitung: { kw: string; stueckzahl: number }[]
  andereAbteilungen: { kw: string; stueckzahl: number }[]
  gesamt: { kw: string; pvBearbeitung: number; andereAbteilungen: number }[]
  faelle: DashboardFalleRow[]
}

type DashboardFalleRow = {
  fallId: string
  createdAt: string
  fauf: string | null
  kundenAuftrag: string | null
  artikelNr: string
  farbe: string
  stueckzahl: number
  fehlercodeId: string | null
  code: string | null
  beschreibung: string | null
  abteilungName: string | null
  verursacherVorname: string | null
  verursacherNachname: string | null
}

function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = React.useState<"pv" | "andere" | "gesamt">("pv")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({})

  const [editFallId, setEditFallId] = React.useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteFallId, setDeleteFallId] = React.useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false)

  async function loadData() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/dashboard")
      if (!res.ok) throw new Error("Daten konnten nicht geladen werden")
      setData(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const filteredFaelle = React.useMemo(() => {
    if (!data) return []
    const departmentFiltered = selectedFilter === "pv"
      ? data.faelle.filter((f) => f.abteilungName === "PV Bearbeitung")
      : selectedFilter === "andere"
        ? data.faelle.filter((f) => f.abteilungName !== "PV Bearbeitung")
        : data.faelle

    const query = searchQuery.toLowerCase().trim()
    if (!query) return departmentFiltered
    return departmentFiltered.filter((row) => {
      const material = `${row.artikelNr} (${row.farbe})`.toLowerCase()
      const code = row.code?.toLowerCase() || row.beschreibung?.toLowerCase() || ""
      const verursacher = `${row.verursacherVorname ?? ""} ${row.verursacherNachname ?? ""}`.toLowerCase()
      return (
        (row.fauf?.toLowerCase().includes(query) ?? false) ||
        (row.kundenAuftrag?.toLowerCase().includes(query) ?? false) ||
        material.includes(query) ||
        code.includes(query) ||
        (row.abteilungName?.toLowerCase().includes(query) ?? false) ||
        verursacher.includes(query)
      )
    })
  }, [data, selectedFilter, searchQuery])

  const columns: ColumnDef<DashboardFalleRow>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="rounded-none"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Alle auswählen"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="rounded-none"
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Zeile auswählen"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Zeit
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => {
          const val = row.getValue("createdAt") as string
          return new Date(val).toLocaleString("de-DE")
        },
      },
      {
        id: "fallTyp",
        header: "Falltyp",
        cell: () => "Ausschuss",
      },
      {
        accessorKey: "fauf",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            FAUF
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => (row.getValue("fauf") as string | null) || "-",
      },
      {
        accessorKey: "kundenAuftrag",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Kundenauftrag
            {getSortIcon(column)}
          </Button>
        ),
        cell: ({ row }) => (row.getValue("kundenAuftrag") as string | null) || "-",
      },
      {
        accessorKey: "material",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Material
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => `${row.artikelNr} (${row.farbe})`,
      },
      {
        accessorKey: "stueckzahl",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Stückzahl
            {getSortIcon(column)}
          </Button>
        ),
      },
      {
        accessorKey: "code",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Code
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => {
          if (!row.fehlercodeId) return "-"
          if (row.code) return `${row.code} - ${row.beschreibung}`
          return row.beschreibung
        },
      },
      {
        accessorKey: "abteilung",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Abteilung
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => row.abteilungName || "-",
      },
      {
        accessorKey: "verursacher",
        header: ({ column }) => (
          <Button variant="ghost" size="sm" onClick={() => cycleSort(column)} className="-ml-2">
            Verursacher
            {getSortIcon(column)}
          </Button>
        ),
        accessorFn: (row) => {
          if (row.verursacherVorname) return `${row.verursacherVorname} ${row.verursacherNachname}`
          return "-"
        },
      },
      {
        id: "actions",
        header: "Aktionen",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setEditFallId(row.original.fallId)
                setEditDialogOpen(true)
              }}
            >
              <Pencil />
              <span className="sr-only">Bearbeiten</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteFallId(row.original.fallId)}
            >
              <Trash2 />
              <span className="sr-only">Löschen</span>
            </Button>
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  )

  const table = useReactTable({
    data: filteredFaelle,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row, index) => `${row.fallId}-${index}`,
    enableRowSelection: true,
  })

  const selectedFallIds = React.useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows
    const ids = new Set<string>()
    for (const row of selectedRows) {
      ids.add(row.original.fallId)
    }
    return Array.from(ids)
  }, [rowSelection])

  const selectedCount = selectedFallIds.length

  async function confirmDeleteFall() {
    if (!deleteFallId) return
    try {
      await deleteFall(deleteFallId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen")
    } finally {
      setDeleteFallId(null)
    }
  }

  function handleBulkDelete() {
    if (selectedCount === 0) return
    setBulkDeleteOpen(true)
  }

  async function confirmBulkDelete() {
    try {
      await bulkDeleteFaelle(selectedFallIds)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen")
    } finally {
      setRowSelection({})
      setBulkDeleteOpen(false)
    }
  }

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin-Dashboard</h1>
          <p className="text-muted-foreground">Ausschuss-Statistiken nach Kalenderwochen</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex h-[100px] items-center justify-center rounded-xl bg-muted">
              <p className="text-muted-foreground">Lade Daten...</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin-Dashboard</h1>
          <p className="text-muted-foreground">Ausschuss-Statistiken nach Kalenderwochen</p>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-xl bg-muted">
          <p className="text-destructive">{error ?? "Keine Daten verfügbar"}</p>
        </div>
      </main>
    )
  }

  const pvConfig = {
    stueckzahl: {
      label: "Stückzahl",
      color: "var(--color-chart-1)",
    },
  }

  const otherConfig = {
    stueckzahl: {
      label: "Stückzahl",
      color: "var(--color-chart-2)",
    },
  }

  const gesamtConfig = {
    pvBearbeitung: {
      label: "PV Bearbeitung",
      color: "var(--color-chart-1)",
    },
    andereAbteilungen: {
      label: "Andere Abteilungen",
      color: "var(--color-chart-2)",
    },
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin-Dashboard</h1>
        <p className="text-muted-foreground">Ausschuss-Statistiken nach Kalenderwochen</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => setSelectedFilter("pv")}
          className="text-left cursor-pointer"
        >
          <Card size="sm" className={selectedFilter === "pv" ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <CardTitle>Ausschuss PV Bearbeitung</CardTitle>
              <CardDescription>Stückzahl pro Kalenderwoche</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={pvConfig}
                className="aspect-auto h-[100px]"
                initialDimension={{ width: 320, height: 100 }}
              >
                <AreaChart accessibilityLayer data={data.pvBearbeitung}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="kw"
                    tickLine={false}
                    tickMargin={6}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="stueckzahl"
                    type="natural"
                    fill="var(--color-stueckzahl)"
                    fillOpacity={0.4}
                    stroke="var(--color-stueckzahl)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("andere")}
          className="text-left cursor-pointer"
        >
          <Card size="sm" className={selectedFilter === "andere" ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <CardTitle>Ausschuss andere Abteilungen</CardTitle>
              <CardDescription>Stückzahl pro Kalenderwoche</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={otherConfig}
                className="aspect-auto h-[100px]"
                initialDimension={{ width: 320, height: 100 }}
              >
                <AreaChart accessibilityLayer data={data.andereAbteilungen}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="kw"
                    tickLine={false}
                    tickMargin={6}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="stueckzahl"
                    type="natural"
                    fill="var(--color-stueckzahl)"
                    fillOpacity={0.4}
                    stroke="var(--color-stueckzahl)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </button>
        <button
          type="button"
          onClick={() => setSelectedFilter("gesamt")}
          className="text-left cursor-pointer"
        >
          <Card size="sm" className={selectedFilter === "gesamt" ? "ring-2 ring-primary" : ""}>
            <CardHeader>
              <CardTitle>Ausschuss Gesamt</CardTitle>
              <CardDescription>Stückzahl pro Kalenderwoche</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={gesamtConfig}
                className="aspect-auto h-[100px]"
                initialDimension={{ width: 320, height: 100 }}
              >
                <AreaChart accessibilityLayer data={data.gesamt}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="kw"
                    tickLine={false}
                    tickMargin={6}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="pvBearbeitung"
                    type="natural"
                    fill="var(--color-pvBearbeitung)"
                    fillOpacity={0.4}
                    stroke="var(--color-pvBearbeitung)"
                  />
                  <Area
                    dataKey="andereAbteilungen"
                    type="natural"
                    fill="var(--color-andereAbteilungen)"
                    fillOpacity={0.4}
                    stroke="var(--color-andereAbteilungen)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => setError(null)}>
            Schließen
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen nach FAUF, Kundenauftrag, Material oder Code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredFaelle.length > 0 ? (
        <>
          {selectedCount > 0 && (
            <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
              <span className="text-sm font-medium">
                {selectedCount} Fall{selectedCount !== 1 ? "e" : ""} ausgewählt
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Löschen
              </Button>
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm whitespace-nowrap text-muted-foreground">
              Seite {table.getState().pagination.pageIndex + 1} von {table.getPageCount()}
            </span>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => table.previousPage()}
                    className={
                      !table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: table.getPageCount() }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={table.getState().pagination.pageIndex === i}
                      onClick={() => table.setPageIndex(i)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => table.nextPage()}
                    className={
                      !table.getCanNextPage() ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Keine Daten</EmptyTitle>
            <EmptyDescription>
              Für den ausgewählten Filter sind keine Ausschuss-Fälle vorhanden.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fall bearbeiten</DialogTitle>
            <DialogDescription>
              Bearbeite die Fall-Daten und speichere die Änderungen.
            </DialogDescription>
          </DialogHeader>
          {editFallId && (
            <FallErfassenPage
              editId={editFallId}
              isAdmin
              onSaved={() => {
                setEditDialogOpen(false)
                setEditFallId(null)
                loadData()
              }}
              onCancel={() => {
                setEditDialogOpen(false)
                setEditFallId(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteFallId} onOpenChange={() => setDeleteFallId(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Fall löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Fall wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFallId(null)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteFall}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Fälle löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die {selectedCount} ausgewählten Fälle wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkDeleteOpen(false)}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmBulkDelete}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [activePage, setActivePage] = React.useState<"home" | "fall-erfassen" | "uebersicht" | "mitarbeiter" | "fehlercodes" | "admin-dashboard">("home")

  const [csvImportOpen, setCsvImportOpen] = React.useState(false)
  const [csvImportResult, setCsvImportResult] = React.useState<{
    neueFaelle: number
    neueMaterialien: number
    error?: string
  } | null>(null)

  const [clearCsvOpen, setClearCsvOpen] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoggedIn(true)
    setDialogOpen(false)
  }

  function handleLogout() {
    setIsLoggedIn(false)
    setActivePage("home")
  }

  async function handleCsvUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    try {
      const res = await fetch("/api/csv-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: text }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCsvImportResult({
          neueFaelle: 0,
          neueMaterialien: 0,
          error: data.error || "Import fehlgeschlagen",
        })
      } else {
        setCsvImportResult({
          neueFaelle: data.neueFaelle ?? 0,
          neueMaterialien: data.neueMaterialien ?? 0,
        })
      }
      setCsvImportOpen(true)
    } catch (err) {
      setCsvImportResult({
        neueFaelle: 0,
        neueMaterialien: 0,
        error: err instanceof Error ? err.message : "Import fehlgeschlagen",
      })
      setCsvImportOpen(true)
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  async function confirmClearCsvData() {
    try {
      const res = await fetch("/api/csv-import", { method: "DELETE" })
      if (!res.ok) throw new Error("Löschen fehlgeschlagen")
    } catch (err) {
      setCsvImportResult({
        neueFaelle: 0,
        neueMaterialien: 0,
        error: err instanceof Error ? err.message : "Löschen fehlgeschlagen",
      })
      setCsvImportOpen(true)
    } finally {
      setClearCsvOpen(false)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activePage === "home"}
                  onClick={() => setActivePage("home")}
                >
                  <Home />
                  <span>Startseite</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activePage === "fall-erfassen"}
                  onClick={() => setActivePage("fall-erfassen")}
                >
                  <ClipboardList />
                  <span>Fall erfassen</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          {isLoggedIn && (
            <SidebarGroup>
              <SidebarGroupLabel>Admin Tools</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "uebersicht"}
                    onClick={() => setActivePage("uebersicht")}
                  >
                    <LayoutDashboard />
                    <span>Übersicht</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "mitarbeiter"}
                    onClick={() => setActivePage("mitarbeiter")}
                  >
                    <Users />
                    <span>Mitarbeiter</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "fehlercodes"}
                    onClick={() => setActivePage("fehlercodes")}
                  >
                    <AlertCircle />
                    <span>Fehlercodes</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "admin-dashboard"}
                    onClick={() => setActivePage("admin-dashboard")}
                  >
                    <BarChart3 />
                    <span>Admin-Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={isLoggedIn ? handleLogout : () => setDialogOpen(true)}
              >
                {isLoggedIn ? <LogOut /> : <LogIn />}
                <span>{isLoggedIn ? "Logout" : "Login"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center justify-between gap-2 border-b p-4">
          <SidebarTrigger />
          {isLoggedIn && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="CSV hochladen"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="CSV-Daten löschen"
                onClick={() => setClearCsvOpen(true)}
              >
                <Database />
              </Button>
            </div>
          )}
        </header>

        {activePage === "home" ? (
          <main className="flex flex-1 flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Willkommen</h1>
              <p className="text-muted-foreground">
                Minimalistischer Platzhalter für den Inhalt deiner Landingpage.
              </p>
            </div>
            <div>
              <Button>Aktion starten</Button>
            </div>
          </main>
        ) : activePage === "fall-erfassen" ? (
          <FallErfassenPage isAdmin={isLoggedIn} />
        ) : activePage === "admin-dashboard" ? (
          <AdminDashboardPage />
        ) : activePage === "uebersicht" ? (
          <UebersichtPage />
        ) : activePage === "mitarbeiter" ? (
          <MitarbeiterPage />
        ) : (
          <FehlercodesPage />
        )}
      </SidebarInset>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Melde dich mit deinen Zugangsdaten an.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Login</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={csvImportOpen} onOpenChange={setCsvImportOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {csvImportResult?.error ? "Import fehlgeschlagen" : "Import erfolgreich"}
            </AlertDialogTitle>
            <AlertDialogDescription className="flex flex-col gap-1">
              {csvImportResult?.error ? (
                <span>{csvImportResult.error}</span>
              ) : (
                <>
                  <span>Neue Fälle: {csvImportResult?.neueFaelle ?? 0}</span>
                  <span>Neue Materialien: {csvImportResult?.neueMaterialien ?? 0}</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setCsvImportOpen(false)}>OK</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearCsvOpen} onOpenChange={setClearCsvOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Datenbank leeren</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du alle importierten CSV-Daten wirklich löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setClearCsvOpen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmClearCsvData}>
              Daten löschen
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
