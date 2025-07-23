import { format } from 'date-fns'

export default function ArticlesDate(props) {

    // const {
    //     test_date
    // } = props;

    let input_date = props?.date
    let date_format = props?.format
    // let date_format = props.format

    if (!input_date) {
        return (
            'Need date prop'
        )
    }

    // if (date instanceof Object) {
    //     date = date.toString()
    // }

    // let newDate = test_date

    return (
        <span date-renderer="ArticlesDate">
            {/* Test = {test_date} */}
            {/* {JSON.stringify(test_date)} */}
            {format( new Date(input_date), (date_format || 'MM/dd/yy - h:mmaa') )}
        </span>
    )
}