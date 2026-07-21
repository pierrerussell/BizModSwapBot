// src/components/ModuleSearch.tsx
import { Section, Input, Cell } from '@telegram-apps/telegram-ui';
import type { ModuleCondensed } from '../types/swap';

interface Props {
    searchQuery: string;
    searchResults: ModuleCondensed[];
    allModules: ModuleCondensed[];
    onSearchChange: (value: string) => void;
    onSearchResultsChange: (results: ModuleCondensed[]) => void;
    onSelect: (mod: ModuleCondensed) => void;
}

export function ModuleSearch({
                                 searchQuery,
                                 searchResults,
                                 allModules,
                                 onSearchChange,
                                 onSearchResultsChange,
                                 onSelect
                             }: Props) {
    const handleInputChange = (value: string) => {
        onSearchChange(value);

        if (!value.trim()) {
            onSearchResultsChange([]);
            return;
        }

        const q = value.toUpperCase();
        const matches = allModules
            .filter((m) => m.moduleCode.includes(q) || m.title.toUpperCase().includes(q))
            .slice(0, 8);

        onSearchResultsChange(matches);
    };

    return (
        <Section header="2. SEARCH MODULE">
            <Input
                header="Module Code"
                placeholder="e.g. MKT1705, DAO1704"
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
            />

            {searchResults.length > 0 && (
                <div
                    style={{
                        background: 'var(--tg-theme-secondary-bg-color, #f4f4f5)',
                        borderRadius: '8px',
                        margin: '8px 0',
                        overflow: 'hidden'
                    }}
                >
                    {searchResults.map((mod) => (
                        <Cell
                            key={mod.moduleCode}
                            onClick={() => onSelect(mod)}
                            subtitle={mod.title}
                        >
                            <strong>{mod.moduleCode}</strong>
                        </Cell>
                    ))}
                </div>
            )}
        </Section>
    );
}