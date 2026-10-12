"use client";

import Switch from "@mui/material/Switch";

export default function ArticlesSwitch({
    setChecked,
    checked,
    readOnly,
    ...props
}) {
    return (
        <Switch
            {...props}
            checked={Boolean(checked)}
            readOnly={Boolean(readOnly) || !setChecked}
            onChange={(_, value) => {
                if (!readOnly) setChecked?.(value);
            }}
            sx={[
                { m: 0 },
                ...(Array.isArray(props.sx)
                    ? props.sx
                    : props.sx
                      ? [props.sx]
                      : []),
            ]}
        />
    );
}
