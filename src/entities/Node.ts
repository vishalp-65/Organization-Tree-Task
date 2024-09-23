import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    Tree,
    TreeParent,
    TreeChildren,
} from "typeorm";

@Entity("nodes")
@Tree("closure-table")
export class Node {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({
        type: "enum",
        enum: ["LOCATION", "DEPARTMENT", "EMPLOYEE", "ORGANIZATION"],
        default: "EMPLOYEE",
    })
    type: string;

    @Column({ type: "varchar", length: 7, default: "#FFFFFF" })
    color: string;

    @TreeParent()
    parent: Node;

    @TreeChildren()
    children: Node[];
}
