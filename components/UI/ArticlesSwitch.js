export default function ArticlesSwitch({
    setChecked,
    checked,
    readOnly
}) {
    return (
        <label className={`articles-switch mb-0 ${checked && 'checked'}`}>
            <input
                type="checkbox"
                readOnly={readOnly ? true : false}
                checked={checked}
                onChange={() => { return }}
            />
            <span
                onClick={(e) => {
                    if (setChecked) {
                        setChecked(!checked)
                        return
                    } else {
                        e.preventDefault()
                        return
                    }
                }}
                className="slider"
            ></span>
        </label>
    )
}