export const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };
  
  export const getStatusVariant = (code: string): 'info' | 'warning' | 'success' | 'secondary' => {
    const c = (code || '').toLowerCase();
    if (c.includes('open') || c.includes('new')) return 'info';
    if (c.includes('progress') || c.includes('pending')) return 'warning';
    if (c.includes('resolved') || c.includes('closed')) return 'success';
    return 'secondary';
  };
  
  export const getPriorityVariant = (code: string): 'destructive' | 'warning' | 'secondary' => {
    const c = (code || '').toLowerCase();
    if (c.includes('critical') || c.includes('high')) return 'destructive';
    if (c.includes('medium')) return 'warning';
    return 'secondary';
  };