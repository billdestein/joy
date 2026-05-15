import React, { createContext, useContext } from 'react'
import { WorkbookType } from '@billdestein/joy-common'

type WorkbookContextType = {
    workbook: WorkbookType
    setWorkbook: (wb: WorkbookType) => void
    isLoading: boolean
    setIsLoading: (v: boolean) => void
    selectedPicFilename: string
    setSelectedPicFilename: (f: string) => void
}

export const WorkbookContext = createContext<WorkbookContextType | null>(null)

export function useWorkbook(): WorkbookContextType {
    const ctx = useContext(WorkbookContext)
    if (!ctx) throw new Error('useWorkbook must be used inside a WorkbookFrame')
    return ctx
}
