
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function SpacingSettings({ props, onPropChange }: { props: any, onPropChange: (prop: string, value: any) => void }) {
    const styles = props.styles || {};
    const handleStyleChange = (prop: string, value: any) => {
      onPropChange('styles', { ...styles, [prop]: value });
    };
  
    return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Margem</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Topo" value={styles.marginTop || ''} onChange={e => handleStyleChange('marginTop', e.target.value)} />
                    <Input placeholder="Direita" value={styles.marginRight || ''} onChange={e => handleStyleChange('marginRight', e.target.value)} />
                    <Input placeholder="Baixo" value={styles.marginBottom || ''} onChange={e => handleStyleChange('marginBottom', e.target.value)} />
                    <Input placeholder="Esquerda" value={styles.marginLeft || ''} onChange={e => handleStyleChange('marginLeft', e.target.value)} />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Padding</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Topo" value={styles.paddingTop || ''} onChange={e => handleStyleChange('paddingTop', e.target.value)} />
                    <Input placeholder="Direita" value={styles.paddingRight || ''} onChange={e => handleStyleChange('paddingRight', e.target.value)} />
                    <Input placeholder="Baixo" value={styles.paddingBottom || ''} onChange={e => handleStyleChange('paddingBottom', e.target.value)} />
                    <Input placeholder="Esquerda" value={styles.paddingLeft || ''} onChange={e => handleStyleChange('paddingLeft', e.target.value)} />
                </div>
            </div>
        </div>
        </div>
    )
  }
